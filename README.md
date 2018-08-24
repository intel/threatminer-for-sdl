# Threat Miner for SDL

A security tool from threat intelligence that uses web scraping and machine learning to identify potential threats in your products or components.

## Prerequisites
1. A [Python 2.7 and Pip](https://github.com/BurntSushi/nfldb/wiki/Python-&-pip-Windows-installation) installation
2. A [Git installation](https://git-scm.com/downloads)
3. Install [Node JS and NPM](https://www.npmjs.com/get-npm)
4. install bower: `npm i -g bower`
5. A running web server. To run a MySQL web server locally, install [WAMP](http://www.wampserver.com/en/) if running on Windows, or install [XAMPP](https://www.apachefriends.org/index.html) if running on MAC/Linux. Create a database called 'threat_intelligence_db'
6. [StanfordCoreNLP](https://stanfordnlp.github.io/CoreNLP/) Downloaded with all jar files in the directory added to the "classpath" environment variable.

## Workflow:
1. Installation Step
2. Usage Step
4. Make necessary code changes
3. Deployment Step

## Installation
```no-highlight
    git clone https://github.com/intel/threatminer-for-sdl
    cd threatminer-for-sdl
    pip install -r requirements.txt
    cd client
    npm install && bower install
```

## Setup
```no-highlight
    python setup.py
```
A prompt will present itself. Enter the following values:
```no-highlight
    Host: localhost
    Username: root
    Password:
    DB: threat_intelligence_db
    Charset: utf8
    port: 3306
    caCert:
    isDeveloping: true
```
To create tables in the database (WARNING! DON'T RUN THIS ON AN EXISTING THREATMINER INSTANCE. IT MAY OVERWRITE YOUR TABLES)
```no-highlight
    cd database
    python createDatabaseTables.py
```

## Usage
If running windows. Note: you can store FLASK_APP and FLASK_ENV values as environment variables to avoid entering every time
```no-highlight
    cd server
    set FLASK_APP=run.py
    set FLASK_ENV=development
```

If running Linux
```no-highlight
    cd server
    export FLASK_APP=run.py
    export FLASK_ENV=development
```

Run the RestAPI:
```no-highlight
    cd server
    flask run
```
Open a new terminal and run the client server:
```no-highlight
    cd client
    gulp serve
```

## Deployment
Clear the "isDeveloping" variable from setup.py
```no-highlight
    python setup.py
```
If you are using https:
1. Uncomment 'if (window.location.protocol == "http:") {' block in client/app.js
2. Add cert file to server/, scripts/, and database/ directories
3. Run "setup.py" and enter the name of the cert file

## Create the training models:
```no-highlight
    cd scripts
    python train.py
```
Set serializeTo in scripts/classifier/configuration.prop to "<scripts/classifier's absolute path> + /ner-model.ser.gz"
## Follow "Testing and deployment" step in docs/client for deploying front end
## Follow "Deployment" step in docs/server for deploying Rest API
## Follow "Virtual Mchine" step in docs/scripts for scheduling scripts
