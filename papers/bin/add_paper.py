from collections import defaultdict
import requests
import argparse
import json
from datetime import datetime
from os.path import exists
from pdf2image import convert_from_bytes
from git import Repo
 
parser = argparse.ArgumentParser(description="Argument Parser",
                                 formatter_class=argparse.ArgumentDefaultsHelpFormatter)
parser.add_argument("-t", "--tags", default="#random", help="tags")
parser.add_argument("-y", "--year", default="2023", type=str, help="year")
parser.add_argument("-n", "--name", default="", help="name")
parser.add_argument("-o", "--output", default="../", help="output")
parser.add_argument("-s", "--status", default="To-Read", help="status")
parser.add_argument("-g", "--git_repo_local", default="", help="git repo to push to")
parser.add_argument("paper_url", help="url")
args = parser.parse_args()
config = vars(args)


# Generate Image to use
r = requests.get(config['paper_url'])
images = convert_from_bytes(r.content)
images[0].save(config['output'] + "/imgs/" + config['paper_url'].split("/")[-1] + ".jpg", 'JPEG')

# JSON Processing
if exists(config['output'] + "/index.json"):
    with open(config['output'] + "/index.json") as f:
        lines = json.loads("\n".join(f.readlines()))
else:
    lines = defaultdict(list)

lines["papers"].append({"name": config['name'], "year": config['year'], "date": datetime.today().strftime('%Y-%m-%d %H:%M:%S') , "status": config["status"], "id": config['paper_url'].split("/")[-1].split(".")[0], "link": config["paper_url"], "tags": config["tags"], "img": config['paper_url'].split("/")[-1] + ".jpg"})
with open(config['output'] + "/index.json", "w") as f:
     f.write(json.dumps(lines))

print(f"Added paper { config['paper_url'] } successfully!")

# Push to Git
if config["git_repo_local"] != "":
    repo = Repo(config["git_repo_local"])
    if not repo.bare:
        repo.git.add(all=True)
        repo.index.commit(f"Added { config['name']}")
        origin = repo.remote(name='origin')
        origin.push()
    else:
        print('Could not load repository at {} :'.format(config['output']))