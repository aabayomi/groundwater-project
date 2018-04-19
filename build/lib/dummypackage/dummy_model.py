import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error


def train_model(split=.25):
    """Tran model based on the iris dataset.

    This will split the iris dataset into train and test set, will
    train a Random Forest CLassifier and fit the trained model to
    the test dataset.
    In addition the confusion matrix and features importance will be
    calculated.

    Args:
        split (float): Fraction of observations in the test dataset.

    Returns:
        RandomForestClassifier: Trained model.
        pandas.DataFrame: Confusion matrix.
        dictionary: Features importance
    """
    iris = load_iris()
    all_data = pd.DataFrame(iris.data, columns=iris.feature_names)
    features = all_data.columns.str.replace('\s+', '_').str.replace('\W+', '')
    all_data['species'] = pd.Categorical.from_codes(iris.target,
                                                    iris.target_names)
    train, test = train_test_split(all_data, test_size=split)
    clf = RandomForestClassifier(n_jobs=1)
    clf.fit(train.drop('species', axis=1), train.species)
    preds = clf.predict(test.drop('species', axis=1))
    conf_matrix = pd.crosstab(test['species'], preds,
                              rownames=['Actual Species'],
                              colnames=['Predicted Species'])
    f_importances = list(zip(train.drop('species', axis=1).columns,
                             clf.feature_importances_))
    return clf, conf_matrix, f_importances, features


def train_model2(split=.25):
    Weather_data= pd.read_csv("/Users/abayomi/Downloads/untitled folder/All Stations/ANDERSON/CROCKETT_412114.csv")

    Groundwater= pd.read_csv("/Users/abayomi/Downloads/untitled folder/edit/dailyAvg/Carrizo-Wilcox/3813106.csv/part-93.csv")

    df = Weather_data.merge(Groundwater, on='date')

    df = df.drop(['Total PRCP(YEARLY)','EVAP','STATION','Unnamed: 0','Unnamed: 0.1','STATION_NAME','SN**','SX**','SNWD','SNOW','WESD','WESF','AWND'],axis=1)

    df = df.replace(' ', np.nan)
    df = df.dropna()
    
    X = df.drop(['AvgWaterfall','date'], axis=1)
    y = df[['AvgWaterfall']]
    
#     train, test = train_test_split(all_data, test_size=split)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=split, random_state=1)

    regression_model = LinearRegression()
    regression_model.fit(X_train, y_train)

    y_predict = regression_model.predict(X_test)
    
    regression_score = regression_model.score(X_test, y_test)

    regression_model_mse = mean_squared_error(y_predict, y_test)
    
#     summary = regression_model.summary()
    
    conf_matrix = df.corr()

    features = X_test.head(5)
    return regression_model,conf_matrix,y_predict,features


def get_feature_importances_fig(clf, f_importance, top=5):
    """Create matplotlib figure of the feature importances.

    This function will generate a bar plot figure where the x axis
    contains the labels of the features and y axis the importances.
    In addition the standard deviation of the importance will be added
    to the bar plots.

    Args:
        clf (scikitlearn.RandomForest): Trained Random Forest model.
        f_importance (list): List containing tuples where the first
            element is the label of the feature and the second the
            importance score. The list should be in the same order as
            the appearence on the matrix columns sent to train the model.
        top (int): Maximum number of most important features to plot.

    Returns:
        matplotlib.figure.Figure: Figure object of the plot of the
            features importance as bar plots.
    """
    importances_name = np.array([f[0] for f in f_importance])
    importances_value = np.array([f[1] for f in f_importance])
    indices = np.argsort(importances_value)[::-1]

    std = np.std([tree.feature_importances_ for tree in clf.estimators_],
                 axis=0)

    fig = plt.figure()
    plt.bar(range(len(indices)), importances_value[indices], color="#AEA79F",
            yerr=std[indices], ecolor="#DD4814", align="center")
    plt.xticks(range(len(indices)), importances_name[indices],
               rotation=45)
    plt.xlim([-1, len(indices)])
    return fig


def get_feature_importances_fig2(regression_model,y_predict,features,top =5 ):
    fig = plt.figure()
    plt.plot(features,y_predict, 'ro')
    plt.axis([0, 6, 0, 20])
    
    return fig
