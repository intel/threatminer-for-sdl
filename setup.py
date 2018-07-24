import os.path
import sys
import json

# get user input and
def configure(config):
    # if config.json was properly setup
    if config:
        print("NOTE: To delete an existing field, Enter a space when prompted for that field.\n")
        host = raw_input("Host [" + config["databaseConnection"]["host"] + "]: ")
        user = raw_input("Username [" + config["databaseConnection"]["user"] + "]: ")
        password = raw_input("Password [" + config["databaseConnection"]["password"] + "]: ")
        db = raw_input("DB [" + config["databaseConnection"]["db"] + "]: ")
        charset = raw_input("Charset [" + config["databaseConnection"]["charset"] + "]: ")
        port = raw_input("Port [" + config["databaseConnection"]["port"] + "]: ")
        if host:
            if host.isspace():
                config["databaseConnection"]["host"] = ""
            else:
                config["databaseConnection"]["host"] = host
        if user:
            if user.isspace():
                config["databaseConnection"]["user"] = ""
            else:
                config["databaseConnection"]["user"] = user
        if password:
            if password.isspace():
                config["databaseConnection"]["password"] = ""
            else:
                config["databaseConnection"]["password"] = password
        if db:
            if db.isspace():
                config["databaseConnection"]["db"] = ""
            else:
                config["databaseConnection"]["db"] = db
        if charset:
            if charset.isspace():
                config["databaseConnection"]["charset"] = ""
            else:
                config["databaseConnection"]["charset"] = charset
        if port:
            if port.isspace():
                config["databaseConnection"]["port"] = ""
            else:
                config["databaseConnection"]["port"] = port
    else:
        print("Enter database configuration information:\n")
        config = {"databaseConnection": {"db": "", "host": "", "user": "", "password": "", "charset": "", "port": ""}}
        config["databaseConnection"]["host"] = raw_input("Host: ")
        config["databaseConnection"]["user"] = raw_input("Username: ")
        config["databaseConnection"]["password"] = raw_input("Password: ")
        config["databaseConnection"]["db"] = raw_input("DB: ")
        config["databaseConnection"]["charset"] = raw_input("Charset: ")
        config["databaseConnection"]["port"] = raw_input("port: ")
    return config

# if config is valid, return configuration information currently in config.json
# otherwise return None
def getConfig():
    # open config.json and load into config
    try:
        configFile = open("config.json")
    except:
        return None
    with configFile as f:
        config = json.load(f)
    configFile.close()
    if "databaseConnection" not in config:
        return None
    keys = ["host", "user", "password", "db", "charset", "port"]
    for key in keys:
        if key not in config["databaseConnection"]:
            return None
    return config

# Overwrites config.json with new config information
def writeConfig(config):
    with open('config.json', 'w+') as outfile:
        json.dump(config, outfile)

def init():
    writeConfig(configure(getConfig()))

init()
