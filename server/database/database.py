from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand
import json
# Load config.json into "config"
with open("../../config.json", "r") as f:
    config = json.load(f)["databaseConnection"]

if config["charset"]:
    config["charset"] = "?charset=" + config["charset"]

if config["port"]:
    config["port"] = ":" + config["port"]

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://" + config["user"] + ":" + config["password"] + "@" + config["host"] + config["port"] + "/" + config["db"] + config["charset"]
print(app.config["SQLALCHEMY_DATABASE_URI"])
db = SQLAlchemy(app)

migrate = Migrate(app, db)
manager = Manager(app)

manager.add_command("db", MigrateCommand)

'''
    Database naming conventions:
        Table names:
            Lowercase
            Multi-word names are separated by underscore
        Column names:
            All columns are prefixed with a shortcode
                When a table name is two words, shortcode is generally
                a combination of the first letters of each words. Ex: In Table
                feed_types, columns could be ft_id, ft_name, etc.
            Foreign keys are prefixed with "fk_"
            Non-id primary keys are prefixed with "pk_"
            Do not use fk or pk for a table shortcode.
'''

class Adversaries(db.Model):
    __tablename__ = "adversaries"
    adv_id = db.Column(db.Integer, primary_key=True)
    adv_name = db.Column(db.String(150), unique=True, nullable=False)
    adv_desc = db.Column(db.Text)

class Feeds(db.Model):
    __tablename__ = "feeds"
    feed_id = db.Column(db.Integer, primary_key=True)
    feed_title = db.Column(db.String(150))
    feed_link = db.Column(db.Text)
    feed_desc = db.Column(db.Text)
    feed_type = db.Column(db.ForeignKey("feedtypes.type_id"), index=True)

class FeedTypes(db.Model):
    __tablename__ = "feedtypes"
    type_id = db.Column(db.Integer, primary_key=True)
    type_name = db.Column(db.String(150), unique=True)
    type_desc = db.Column(db.Text)

class Keywords(db.Model):
    __tablename__ = "keywords"
    keyword_id = db.Column(db.BigInteger, primary_key=True)
    keyword = db.Column(db.String(200))
    product_id = db.Column(db.ForeignKey("products.product_id"), index=True)

class ProductCategories(db.Model):
    __tablename__ = "productcategories"
    category_id = db.Column(db.Integer, primary_key=True)
    category_name = db.Column(db.String(100), unique=True)
    category_desc = db.Column(db.Text)

class Products(db.Model):
    __tablename__ = "products"
    product_id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String(150))
    product_desc = db.Column(db.Text)
    category_id = db.Column(db.ForeignKey("productcategories.category_id"), index=True)
    product_editor = db.Column(db.String(200))
    product_updated = db.Column(db.String(30))
    product_emailTime = db.Column(db.String(30))

class ThreatCategories(db.Model):
    __tablename__ = "threatcategories"
    category_id = db.Column(db.Integer, primary_key=True)
    category_name = db.Column(db.String(150), unique=True)
    category_desc = db.Column(db.Text)

class Threats(db.Model):
    __tablename__ = "threats"
    threat_id = db.Column(db.BigInteger, primary_key=True)
    threat_title = db.Column(db.Text)
    threat_link = db.Column(db.Text)
    threat_desc = db.Column(db.Text)
    threat_status = db.Column(db.String(45))
    threat_date = db.Column(db.String(30))
    feed_id = db.Column(db.ForeignKey("feeds.feed_id"), index=True)
    threat_rating = db.Column(db.String(45))
    threat_owner = db.Column(db.String(9), index=True)
    threat_note = db.Column(db.Text)
    adv_id = db.Column(db.ForeignKey("adversaries.adv_id"), index=True)
    category_id = db.Column(db.ForeignKey("threatcategories.category_id"), index=True)
    threat_editor = db.Column(db.String(200))
    product_id = db.Column(db.ForeignKey("products.product_id"), index=True)

class Users(db.Model):
    __tablename__ = "users"
    user_id = db.Column(db.Integer, primary_key=True)
    user_username = db.Column(db.String(20), unique=True, index=True)
    user_password = db.Column(db.String(256))
    user_firstName = db.Column(db.String(45))
    user_role = db.Column(db.String(45))
    user_lastName = db.Column(db.String(45))
    user_email = db.Column(db.Text)

if __name__ == "__main__":
    manager.run()
