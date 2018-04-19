# change default plotting backend for the complete application
#!/usr/bin/env python
import matplotlib
matplotlib.use('agg')

from flask import Flask, render_template, request, jsonify

import string
import random
import pandas as pd
import json


from flask_restful import Api

from flask_assets import Bundle,Environment
from dummypackage.dummy_model import train_model
from dummypackage.dummy_model import train_model2
from resources.form_submitter_dummy import FormSubmitterDummy
from resources.form_submitter import FormSubmitter

app = Flask(__name__)
api = Api(app)

app.static_url_path='/static'

datapath ='./data/'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/index1')
def index1():
    return render_template('index1.html')



@app.route('/_get_letters')
def letter_replace():
    alphabet = string.ascii_lowercase
    data = list(request.args.get('dataset', alphabet,type=str))
    replace = request.args.get('replace', 3, type=int)

    indices = range(len(data))
    random.shuffle(indices)
    for index in indices[:replace]:
        data[index] = alphabet[int(random.random() * 25)]
    return jsonify(result=''.join(data))

@app.route('/graph')
def graph():
    return render_template('graph.html')#,data=data)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/people')
def people():
    return render_template('people.html')
   

 
# @app.route('/data')
# def get_data():

#     df = pd.read_csv('data.csv') 
#     cols_to_keep = ['Preci','Tmax','Tmin','Tobs']
#     df_clean = df[cols_to_keep].dropna()

#     chart_data = df.to_json(orient='records')
#     chart_data = json.dumps(chart_data, indent=2)
#     data = {'chart_data': chart_data}


#     # return df.to_json(orient='records')
#     return render_template('graph.html',data=data)



@app.route('/visualisation')
def visualisation():
    return render_template('visualisation.html')



# dummy application
api.add_resource(
    FormSubmitterDummy, '/dummy',
    resource_class_kwargs={
        'select_list_options': [{'key': 'value_0'},
                                {'key': 'value_1'},
                                {'key': 'value_2'}],
        'data_list_options': [{'country': 'Mexico'},
                              {'country': 'Netherlands'},
                              {'country': 'Honduras'}],
        'radio_buttons_options': ['option_0', 'option_1', 'option_2']})


# groundwater prediction application
model, confusion, features_imp, features = train_model()
model2, confusion2, features_imp2, features2 = train_model2()


api.add_resource(
    FormSubmitter, '/prediction-wizard',
    resource_class_kwargs={
        'model': model,
        'features': features,
        'confusion_matrix': confusion,
        'features_imp': features_imp,
        'model2': model2,
        'features2': features2,
        'y_predict': features_imp2,
        'confusion2': confusion2
        })
