import pandas as pd
import requests
import json

def get_data_by_id(resource_id):
	url = f"https://data.gov.sg/api/action/datastore_search?resource_id={resource_id}"
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
				measure['coverage'] = json.loads(field['detected_types'])[0]['metadata']['coverage']
			measures.append(measure)
	info = {
		"name": resource_name,
		"resource_id": resource_id,
		"total_rows": total_rows,
		"measures": measures,
		"values": values
	}

	return info	


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
			df3 = df3.sort_values(by=processed_fields[1],ascending=True)
			df3 = df3.where(pd.notnull(df3), None)
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
