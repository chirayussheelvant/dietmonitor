# dietmonitor

This project is about a diet monitoring application where the input is taken from the user using Alexa. This eliminates the need for the user to manually enter the food items and also eliminates the need to login to the application every time when the user wants to give the details of the food item consumed. Alexa takes the input voice and converts it to string. Then it passes the given string to an NLP parser which splits the string into 3 parts - food name, quantity and unit such as cup, bowl etc. Then this information is stored in the MongoDB Atlas as a temporary data. When the user logs in to the application the data gets stored into the MySQL database. Using this data stored in the MySQL database, the Edamam API is used to extract the information about the nutrient content in each food item and is stored as numerical value in another table. The Edamam is an open source database which contains various food items. The API returns information as numerical value of 20 different nutrients such as carbohydrates, fats, proteins etc. contained in the particular food item contained in that food item. Using this data stored, different table views, card views and graphical views are plotted. The application also provides user to search for recipes based on his or her intolerances. The user has to enable the Alexa skill on his Alexa device. The Alexa skill is developed using Alexa Developer Console. Thus, this project monitors the diet intake based on the voice input.
