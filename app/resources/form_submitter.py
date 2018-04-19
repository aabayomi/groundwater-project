import pandas as pd
import matplotlib.pyplot as plt

from flask import render_template
from flask import Response
from flask_restful import Resource
from flask_restful import reqparse

from dummypackage.dummy_model import get_feature_importances_fig
from dummypackage.dummy_model import get_feature_importances_fig2
from resources.utils import pandas_plot_to_html



class FormSubmitter(Resource):
    """Resource class to handle the a post or get request.

    In order to use this class together with an html input form, the
    endpoint where the form makes the request to, and this class should
    be linked via the flask_restful.Api class.

    >>> from flask_restful import Api
    >>> from resources.form_submitter import FormSubmitter
    >>> api = Api(flask_app)
    >>> api.add_resource(FormSubmitter, endpoint)

    Depending on the request method to the endpoint, the corresponding
    method of this class will be executed.

    The input fields defined in the html form are loaded into the class
    instance via the flask_restful.reqparse.RequestParser.

    Arguments to the class can be pased directly to the __init__ (not
    via the parser) by passing then using the `resource_class_kwargs`
    argument

    >>> api.add_resource(FormSubmitter, endpoint,
                         resource_class_kwargs=some_dictionary)
    """

    def __init__(self, model, features, confusion_matrix, features_imp, model2, features2, confusion2, y_predict, **kwargs):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('preci', type=float)
        self.parser.add_argument('min_temp', type=float)
        self.parser.add_argument('max_temp', type=float)
        self.parser.add_argument('obs_temp', type=float)
        self.parser.add_argument('return_html', type=bool, default=False)
        args = self.parser.parse_args()
        self.return_html = args['return_html']
        self.user_inputs = {k: v
                            for k, v in args.items()
                            if v is not None and k is not 'return_html'}



        self.model = model
        self.features = features
        self.confusion_matrix = confusion_matrix
        self.features_imp = features_imp


        self.model2 = model2
        self.features2 = features2
        self.y_predict = y_predict
        self.confusion2 = confusion2
        super().__init__()

    def get(self):
        res = Response(
            render_template('groundwater.html',
                            left_panel='input_groundwater.html',
                            tab_0='dataframe.html',
                            tab_1='plot.html',
                            tab_2='dataframe.html')
        )
        return res

    def post(self):
        """Method to execute for a post request.
        """
        #fig = get_feature_importances_fig(self.model, self.features_imp)
        fig = plt.figure()
        ax = fig.add_subplot(111)
        cax = ax.matshow(self.confusion2, vmin=-1, vmax=1)
        fig.colorbar(cax)

        img = pandas_plot_to_html(fig)

        prediction, probabilities = self.predict()
        # prediction = self.predict()
        probabilities = probabilities.T
        probabilities.columns = ['Probabilities']
        # different response depending if coming from UI or from
        # a post request command
        if self.return_html:
            res = Response(
                render_template("groundwater.html",
                                left_panel='input_groundwater.html',
                                tab_0='classification.html',
                                tab_1='plot.html',
                                tab_2='dataframe.html',
                                prediction_label=str(prediction[0]), #prediction.title(),
                                probabilities= probabilities.to_html(),
                                plot_title="Correlation Matrix Visualisation",
                                plot=img,
                                dataframe_title='Correlation matrix value',
                                dataframe=self.confusion2.to_html(),
                                **self.user_inputs),
                status=200)
        else:
            res = prediction
        return res

    def predict(self):
        """Make prediction using the trained model.

        Returns:
            The single prediction based on inputs and the probability
            of each class.
        """
        observation = pd.DataFrame(self.user_inputs, index=[0])
        prediction = self.model2.predict(observation) #predict(observation)
        probabilities = self.model.predict_proba(observation)
        prob = pd.DataFrame(probabilities, columns=self.model.classes_)
        return prediction[0] , prob
