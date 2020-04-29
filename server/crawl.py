import json
import requests

if __name__ == "__main__":
    datasets = {
        "data": []
    }
    resp = requests.get("https://data.gov.sg/api/action/package_list", verify=False)
    if resp.status_code != 200:
        print("Request failed: " + resp.text)
        quit()
    package_list = resp.json()['result']
    try:
        for package in package_list:
            resp = requests.get(f"https://data.gov.sg/api/action/package_show?id={package}", verify=False)
            if resp.status_code != 200:
                print("Request failed: " + resp.text)
                quit()
            resources = resp.json()['result']['resources']
            for resource in resources:
                item = {
                    "name": resource['name'],
                    "id": resource['id'],
                    "description": resp.json()['result']['description']
                }
                datasets['data'].append(item)
                print("appended")
    except:
        with open('db.json', 'w', encoding='utf-8') as f:
            json.dump(datasets, f, ensure_ascii=False, indent=4)
    with open('db.json', 'w', encoding='utf-8') as f:
            json.dump(datasets, f, ensure_ascii=False, indent=4)