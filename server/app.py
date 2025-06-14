'''server/app.py - main api app declaration'''
from flask import Flask, session, request, jsonify, render_template, make_response
from flask_cors import CORS, cross_origin
import requests
import helper

'''Main wrapper for app creation'''
app = Flask(__name__, static_folder='../build')
CORS(app)

##
# API routes
##

app.config['JSON_SORT_KEYS'] = False  # prevent alphabetical sort

@app.route('/api/items')
def items():
	'''Sample API route for data'''
	return jsonify([{'title': 'A'}, {'title': 'B'}])


@app.route('/api/resource', methods=['GET'])
def resource():
	"""
	API route for retrieving dataset metadata via data.gov.sg API
	Required parameter: resource_id
	Returns resource name, id, total rows, measures and values
	"""

	resource_id = request.args.get('resource_id')
	
	if resource_id is None or resource_id == '':
		resp = make_response("No resource ID specified", 400)
		return resp
	
	id_query = request.args.get('resource_id')
	id_list = id_query.split(',')
	
	info = []

	for resource in id_list:
		response = helper.get_info_by_resource_id(resource)

		if response.status_code == 404:
			resp = make_response(f"Requested resource (ID: {resource}) does not exist", 404)
			return resp

		info_entry = response.json()['result']
		info.append(helper.process_info(info_entry))

	info_object = {
		"info": info
	}
	
	resp = make_response(info_object, 200)

	return resp


@app.route('/api/data', methods=['GET', 'POST'])
def data():
	# should return x-axis (list) and series (dict of lists)
	resource_id = request.args.get('resource_id')
	
	if resource_id is None or resource_id == '':
		resp = make_response("No resource ID specified", 400)
		return resp
	
	id_query = request.args.get('resource_id')
	id_list = id_query.split(',')

	if request.method == 'POST':
		body = request.json
		resp = helper.new_process_data(body)
		return resp
	
	data = []

	for resource in id_list:
		response = helper.get_data_by_id(resource)

		if response.status_code == 404:
			resp = make_response(f"Requested resource (ID: {resource}) does not exist", 404)
			return resp

		data.append(response.json()['result']['records'])

	year, series1, series2 = helper.process_data(data[0], data[1])
	processed_data = {
		"xaxis": year,
		"series1": series1,
		"series2": series2
	}

	resp = make_response(processed_data, 200)

	return resp

##
# View route
##

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
	'''Return index.html for all non-api routes'''
	return render_template('index.html')
