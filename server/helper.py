from flask import make_response
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


def process_fields(fields1, fields2):
	# find column with "year", "half-year", "quarter", "month" in time-based series
	# how to handle same interval - return field_id1, field_id2
	# how to handle both time but diff interval - return field_id1, field_id2
	# how to handle cases with no common columns - return false

	field_id1, field1_interval = check_time_interval(fields1)
	field_id2, field2_interval = check_time_interval(fields2)

	if field_id1 is None or field_id2 is None:
		return False
	elif field1_interval == field2_interval:
		return [True, field_id1, field_id2]
	else:
		return [False, field_id1, field_id2]


def process_data(data1, data2):
	# try to merge with common column
	# e.g. df1.merge(df2, how='left', left_on='year', right_on='academic_year')
	fields1 = data1['result']['fields']
	fields2 = data2['result']['fields']

	records1 = data1['result']['records']
	records2 = data2['result']['records']

	processed_fields = process_fields(fields1, fields2)

	if processed_fields is False:
		pass
	else:
		df1 = pd.DataFrame(records1)
		df2 = pd.DataFrame(records2)

		if processed_fields[0] is True:
			### HERE. assume for now that left join, left range > right 
			df3 = df1.merge(df2, how='left', left_on=processed_fields[1], right_on=processed_fields[2])
			df3 = df3.sort_values(by=processed_fields[1],ascending=True) # sort bc some datasets are reversed
			df3 = df3.where(pd.notnull(df3), None) # replace NaN with None so null in JSON
			year = df3[processed_fields[1]].tolist()
			series1 = {
				"name": 'Enrolment - MOE Kindergartens', 
				"data": df3['enrolment'].tolist()
			}
			series2 = {
				"name": "Republic Polytechnic Total Enrolment 2019",
				"data": df3['total_enrolment'].tolist()
			}
			
			return year, series1, series2


def check_time_interval(fields):
	field_id = ""
	field_interval = ""
	for item in fields:
		field = item['id']
		if "month" in field:
			field_id = field
			field_interval = 1
			break
		elif "quarter" in field:
			field_id = field
			field_interval = 3 
			break
		elif "half-year" in field:
			field_id = field
			field_interval = 6
			break
		elif "year" in field:
			field_id = field
			field_interval = 12
			break
		else:
			field_id = None
			field_interval = None 
	return field_id, field_interval


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
								label = item['title']
							labelled_sorted_data[label] = v
		else:
			for measure in non_datetime_measures:
				for option in dataset[measure]:
					new_list = list(filter(lambda x: x[measure] == option, data_required))
					if 'datetime' in dataset:
						datetime = dataset['datetime']
						value = dataset['values']
						sorted_data[option][datetime] = list(map(lambda x: x[datetime], new_list))
						sorted_data[option][value] = list(map(lambda x: x[value], new_list))
						meta = get_info_by_resource_id(id).json()['result']['fields']
						labelled_sorted_data = {}
						for sorted_list in sorted_data:
							for k,v in sorted_list.items():
								for item in meta:
									if item['name'] == k:
										if item['type'] == 'datetime':
											label = standardised_time_label(item)
											dataset['interval'] = label
										else:
											label = item['title']
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

	resp = make_response({"data": chart_data}, 200)
	return resp


def same_time_interval(data, interval):
	dfs = []
	multi = False
	for dataset in data.values():
		for items in dataset.values():
			if isinstance(items, dict):
				# code for multilayer
				pass
			else:
				break
		dfs.append(pd.DataFrame.from_dict(dataset))
	time = []
	if not multi:
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
