from flask import make_response
import itertools
import pandas as pd
import requests
import json

def get_data_by_id(resource_id, limit=None, offset=None):
	url = f"https://data.gov.sg/api/action/datastore_search?resource_id={resource_id}"
	if limit:
		url += f"&limit={limit}"
	if offset:
		url += f"&offset={offset}"
	response = requests.get(url)
	return response


def get_info_by_resource_id(resource_id):
	url = f"https://data.gov.sg/api/action/resource_show?id={resource_id}"
	response = requests.get(url)
	return response


def process_info(info):
	# return NAME, RESOURCE_ID, TOTAL_ROWS, MEASURES, VALUES in a JSON object format

	resource_name = info['name']
	resource_id = info['id']
	total_rows = info['fields'][0]['total']
	measures = []
	values = []
	for field in info['fields']:
		if 'unit_of_measure' in field:
			title = field['title'] # to label dataset
			unit = field['unit_of_measure'] # to label axis
			name = field['name'] # to find within dataset
			value = {
				"title": title,
				"unit": unit,
				"name": name
			}
			values.append(value)
		else:
			title = field["title"]
			name = field["name"]
			datatype = field["type"]
			measure = {
				"title": title,
				"name": name,
				"type": datatype
			}
			if 'coverage' in json.loads(field['detected_types'])[0]['metadata']:
				measure['interval'] = field["sub_type"]
				measure['coverage'] = json.loads(field['detected_types'])[0]['metadata']['coverage']
				measure['options'] = get_measure_options(resource_id, total_rows, name)
			else:
				measure['options'] = get_measure_options(resource_id, total_rows, name)
			measures.append(measure)
	info = {
		"name": resource_name,
		"resource_id": resource_id,
		"total_rows": total_rows,
		"measures": measures,
		"values": values
	}

	return info	


def get_measure_options(resource_id, total_rows, measure_name):
	resp = get_data_by_id(resource_id, limit=total_rows)
	# required to go through entire dataset because of how some datasets are ordered
	data = resp.json()['result']['records']
	options = []
	for record in data:
		option = record[measure_name]
		if option in options:
			continue
		else:
			options.append(option)
	return options


def new_process_data(options):
	options = options['data']
	all_data = {}

	# filter to only retain data in the range selected by user
	for dataset in options:
		id = dataset['id']
		limit = dataset['total_rows']
		
		response = get_data_by_id(id, limit=limit)

		if response.status_code == 404:
			resp = make_response(f"Requested resource (ID: {resource}) does not exist", 404)
			return resp

		records = response.json()['result']['records']
		data_required = []
		for record in records:
			include = True
			for key, value in record.items():
				if key == "_id":
					continue
				if key != dataset['values']: # check measures only
					if value not in dataset[key]:
						include = False
						break
			if include:
				data_required.append(record)

		# split by measures (non-datetime), then separate arrays for x and y
		sorted_data = {}
		non_datetime_measures = []
		skip = ['dataset_name', 'id', 'total_rows', 'datetime', 'interval', 'values']
		if 'datetime' in dataset:
			skip.append(dataset['datetime'])
		for key, value in dataset.items():
			if key not in skip:
				non_datetime_measures.append(key)
		if len(non_datetime_measures) is 0:
			if 'datetime' in dataset:
				datetime = dataset['datetime']
				value = dataset['values']
				sorted_data[datetime] = list(map(lambda x: x[datetime], data_required))
				sorted_data[value] = list(map(lambda x: x[value], data_required))
				meta = get_info_by_resource_id(id).json()['result']['fields']
				labelled_sorted_data = {}
				for k,v in sorted_data.items(): # replace labels with proper names
					for item in meta:
						if item['name'] == k:
							if item['type'] == 'datetime':
								label = standardised_time_label(item)
								dataset['interval'] = label
							else:
								label = dataset['dataset_name'] + " - " + item['title']
							labelled_sorted_data[label] = v
		else:
			if 'datetime' in dataset:
				all_options = []
				for measure in non_datetime_measures:
					options_list = dataset[measure]
					all_options.append(options_list)
				combinations = list(itertools.product(*all_options))
				value = dataset['values']
				dataset_label = dataset['dataset_name'] + ": "
				for combination in combinations:
					go_deeper(sorted_data, combination, non_datetime_measures, data_required, value, dataset_label)
				datetime = dataset['datetime']
				sorted_data[datetime] = dataset[datetime]
				meta = get_info_by_resource_id(id).json()['result']['fields']
				value_title = list(filter(lambda x: x['name'] == value, meta))[0]['title']
				labelled_sorted_data = {}
				for k,v in sorted_data.items():
					if k == datetime:
						field = list(filter(lambda x: x['name'] == k, meta))[0]
						label = standardised_time_label(field)
						dataset['interval'] = label
					else:
						label = k + " - " + value_title
					labelled_sorted_data[label] = v
		
		all_data[dataset['dataset_name']] = labelled_sorted_data
	
	# now to combine the data
	is_datetime = True
	is_same_interval = True
	interval = ''
	for dataset in options:
		if 'datetime' not in dataset:
			is_datetime = False
			continue 
		else:
			if interval == '':
				interval = dataset['interval']
			else:
				if dataset['interval'] != interval:
					is_same_interval = False

	if is_same_interval:
		chart_data = same_time_interval(all_data, interval)
	elif is_datetime:
		chart_data = diff_time_interval(all_data, options)

	resp = make_response({"data": chart_data}, 200)
	return resp


def same_time_interval(data, interval):
	dfs = []
	for dataset in data.values():
		dfs.append(pd.DataFrame({k: pd.Series(v) for k, v in dataset.items()}))
	time = []
	for dataset in data.values():
		time.append(dataset[interval])
	time_set = []
	for item in time:
		time_set = time_set + item
	time_set = {interval: list(sorted(set(time_set)))}
	control_df = pd.DataFrame.from_dict(time_set)
		
	merged_df = control_df
	for df in dfs:
		merged_df = merged_df.merge(df, how='left', left_on=interval, right_on=interval)
	merged_df = merged_df.where(pd.notnull(merged_df), None) # replace NaN with None so null in JSON

	chart_data = {
		"datetime": interval,
		interval: merged_df[interval].tolist()
	}
	for column in merged_df:
		chart_data[column] = merged_df[column].tolist()
			
	return chart_data


def diff_time_interval(data, options):
	dfs = []

	interval_types = ['Month', 'Quarter', 'Half Year', 'Year']
	shortest_interval = ''

	for dataset in options:
		interval = dataset['interval']
		if shortest_interval == '':
			shortest_interval = interval
		else:
			index = interval_types.index(interval)
			if index < interval_types.index(shortest_interval):
				shortest_interval = interval

	for key,dataset in data.items():
		if shortest_interval not in dataset:
			this_interval = ''
			for sets in options:
				if sets['dataset_name'] == key:
					this_interval = sets['interval']
			dataset[shortest_interval] = change_interval(dataset.pop(this_interval), this_interval, shortest_interval)
		data[key] = dataset

	for dataset in data.values():
		dfs.append(pd.DataFrame({k: pd.Series(v) for k, v in dataset.items()}))

	time = []
	for dataset in data.values():
		time.append(dataset[shortest_interval])
	time_set = []
	for item in time:
		time_set = time_set + item
	time_set = set(sorted(set(time_set)))
	time_set = {shortest_interval: list(fill_missing_values(time_set, shortest_interval))}
	control_df = pd.DataFrame.from_dict(time_set)
		
	merged_df = control_df
	for df in dfs:
		merged_df = merged_df.merge(df, how='left', left_on=shortest_interval, right_on=shortest_interval)
	
	merged_df = merged_df.apply(pd.to_numeric, errors='ignore')
	merged_df = merged_df.interpolate()
	merged_df = merged_df.round(1)
	merged_df = merged_df.where(pd.notnull(merged_df), None) # replace NaN with None so null in JSON

	chart_data = {
		"datetime": shortest_interval,
		shortest_interval: merged_df[shortest_interval].tolist()
	}
	for column in merged_df:
		chart_data[column] = merged_df[column].tolist()
			
	return chart_data


def standardised_time_label(field):
	if field['sub_type'] == "year":
		return "Year"
	elif field['sub_type'] == "quarter":
		return "Quarter"
	elif field['sub_type'] == "half_year":
		return "Half Year"
	elif field['sub_type'] == "month":
		return "Month"
	else:
		raise ValueError("Not datetime")


def go_deeper(dict, tuple, measures, data, value, label):
	data = list(filter(lambda x: x[measures[0]] == tuple[0], data))
	if tuple[0] == tuple[-1]: # if last element
		value_data = list(map(lambda x: x[value], data))
		label += tuple[0]
		dict[label] = value_data
	else:
		label += (tuple[0] + ', ')
		return go_deeper(dict, tuple[1:], measures[1:], data, value, label)


def fill_missing_values(time_set, interval):
	filled_time = set(time_set)
	for entry in time_set:
		year = entry[:4]
		if interval == "Half Year":
			all_possible = {f'{year}-H1', f'{year}-H2'}
		elif interval == "Quarter":
			all_possible = {f'{year}-Q1', f'{year}-Q2', f'{year}-Q3', f'{year}-Q4'}
		elif interval == "Month":
			all_possible = {f'{year}-01', f'{year}-02', f'{year}-03', f'{year}-04', f'{year}-05', f'{year}-06', f'{year}-07', f'{year}-08', f'{year}-09', f'{year}-10', f'{year}-11', f'{year}-12'}
		filled_time.update(all_possible)

	return list(sorted(list(time_set)))


def change_interval(time_series, original_interval, target_interval):
	if target_interval == "Half Year":
		if original_interval == "Year":
			new_time = list(map(lambda x: x + "-H1", time_series))
	
	if target_interval == "Quarter":
		if original_interval == "Year":
			new_time = list(map(lambda x: x + "-Q1", time_series))
		elif original_interval == "Half Year":
			new_time = list(map(lambda x: (x[:4] + "-Q1") if "H1" in x else (x[:4] + "-Q3"), time_series))
	
	if target_interval == "Month":
		if original_interval == "Year":
			new_time = list(map(lambda x: x + "-01", time_series))
		elif original_interval == "Half Year":
			new_time = list(map(lambda x: (x[:4] + "-01") if "H1" in x else (x[:4] + "-07"), time_series))
		elif original_interval == "Quarter":
			new_time = list(map(lambda x: (x[:4] + "-01") if "Q1" in x else ((x[:4] + "-04") if "Q2" in x else ((x[:4] + "-07") if "Q3" in x else (x[:4] + "-10"))), time_series))

	return new_time
