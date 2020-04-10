import pandas as pd
import requests

def get_data_by_id(resource_id):
	url = f"https://data.gov.sg/api/action/datastore_search?resource_id={resource_id}"
	response = requests.get(url)
	return response


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
	fields1 = list(map(lambda x: x['result']['fields'], data1))
	fields2 = list(map(lambda x: x['result']['fields'], data2))

	records1 = list(map(lambda x: x['result']['records'], data1))
	records2 = list(map(lambda x: x['result']['records'], data2))

	processed_fields = process_fields(fields1, fields2)

	if processed_fields is False:
		pass
	else:
		df1 = pd.DataFrame(records1)
		df2 = pd.DataFrame(records2)

		if processed_fields[0] is True:
			### HERE
			df1.merge(df2, how='outer', left_on=processed_fields[1], right_on=processed_fields[2])

	



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
