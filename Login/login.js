const mysql = require('mysql2');
const express = require('express');
const session = require('express-session');
const path = require('path');
// const cookieParser = require('cookie-parser');
// const { Builder, By, Key, until } = require('selenium-webdriver');

// const ingredients = ['butter', 'cheese', 'avocado'];
///////////////////////////////////////////////////////////////SELENIUM
// async function addIngredientsToCart() {
//   const driver = await new Builder().forBrowser('chrome').build();

//   try {
//     // Navigate to Amazon's homepage
//     await driver.get('https://www.amazon.com/');

//     for (const ingredient of ingredients) {
//       // Search for the ingredient
//       const searchBox = await driver.findElement(By.id('twotabsearchtextbox'));
//       await searchBox.sendKeys(ingredient, Key.RETURN);

//       // Select the first result
//     //   const firstResult = await driver.findElement(By.css('[data-index="0"] .s-result-item'));
// 	// const firstResult = await driver.findElement(By.xpath("//*[contains(text(),)]"));
// 	const searchResults = await driver.findElements(By.css(".s-result-item"));

// // Loop through the search results and find the one with the matching text
// for (const result of searchResults) {
//   const resultText = await result.getText();
//   if (resultText.includes()) {
//     await result.click(ingredient);
//     break;
//   }
// }

//     //   await firstResult.click();

//       // Add the product to cart
//       const addToCartButton = await driver.findElement(By.id('add-to-cart-button'));
//       await addToCartButton.click();

//       // Navigate back to the homepage
//       await driver.get('https://www.amazon.com/');
//     }

//     // Go to the cart to see all the items
//     const cartButton = await driver.findElement(By.id('nav-cart'));
//     await cartButton.click();
//   } finally {
//     // await driver.quit();
//   }
// }



const fileUpload = require("express-fileupload");
const { Console } = require('console');


// const filesPayloadExists = require('./middleware/filesPayloadExists');
// const fileExtLimiter = require('./middleware/fileExtLimiter');
// const fileSizeLimiter = require('./middleware/fileSizeLimiter');

const connection = mysql.createConnection({
	host     : '127.0.0.1',
    user     : 'root',
    password : 'chir12321',
    database : 'diet'
});

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));
// app.use(cookieParser());
// http://localhost:3000/
app.get('/', function(request, response) {
	// Render login template
	// response.sendFile(path.join(__dirname + '/index.html'));
	
	response.sendFile(path.join(__dirname + '/mainpage.html'));
});

app.get('/jump', function(request, response) {
	// Render login template
	//  response.sendFile(path.join(__dirname + '/index.html'));
	// response.redirect('/index.html');
	response.sendFile(path.join(__dirname + '/index.html'));
});

// http://localhost:3000/auth
app.post('/auth', function(request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
	const str="sdnjs%%5%$4322$$$sadafsbh";
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE username = ? AND AES_ENCRYPT(?,?)=password', [username, password,str], function(error, results, fields) {
			// If there is an issue with the query, output the error
			// console.log(username);
			// console.log(password);
			// console.log(results);
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = username;
				// document.cookie = `username=${username};expires=1800 * 1000;path=/`;
				// response.cookie("username",username);
				// sessionStorage.setItem("user",username);
				// response.redirect('/table.html');
				var userN=request.session.username;
				// run(userN);
				console.log(userN);
				response.redirect('/dashboard.html');
				// addIngredientsToCart();
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});




app.post('/reg', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
//    console.log(username);
//    console.log(password);
	// Validate the input
	if (!username || !password) {
	  return res.status(400).send({ message: 'Bad Request: Missing required fields' });
	}
  
	// Check if the username already exists in the database
	connection.query(
	  'SELECT * FROM accounts WHERE username = ?',
	  [username],
	  (error, results) => {
		if (error) throw error;
  
		if (results.length > 0) {
		  return res.status(409).send({ message: 'Conflict: User already exists' });
		}
  
		// Create the user object
		const user = {
		  username,
		  password
		};
        const str="sdnjs%%5%$4322$$$sadafsbh";
		// Save the user to the database
			connection.query('INSERT INTO accounts(username, password) values (?, AES_ENCRYPT(?,?))', [username, password,str],
		  (error, results) => {
			if (error) throw error;
			req.session.loggedin = true;
			req.session.username = username;
			res.redirect('/quiz.html');;
		  }
		);
	  }
	);
  });


// http://localhost:3000/home
// app.get('/home', function(request, response) {
// 	// If the user is loggedin
// 	if (request.session.loggedin) {
// 		// Output username
		
		
// 	} else {
// 		// Not logged in
// 		response.send('Please login to view this page!');
// 	}
// 	response.end();
// });

app.get('/api/getDesserts', (req, res) => {
    console.log(req.session.username);
	// Parse query parameters
	// console.log(request.session.username);
	const page = parseInt(req.query.page, 10) || 1;
	const rowsPerPage = parseInt(req.query.rowsPerPage, 10) || 10;
	const sortBy = req.query.sortBy || 'name';
	const descending = req.query.descending === 'true';
  
	// Build MySQL query
	const orderBy = `ORDER BY ${sortBy} ${descending ? 'DESC' : 'ASC'}`;
	const limit = `LIMIT ${(page - 1) * rowsPerPage}, ${rowsPerPage}`;
	const sql = `SELECT * FROM nutrient ${orderBy} ${limit}`;
  
	// Execute MySQL query
	connection.query(sql, (error, results) => {
	  if (error) {
		console.error(error);
		res.sendStatus(500);
	  } else {
		const items = results;
		// Get total number of items in the table
		connection.query('SELECT COUNT(*) AS total FROM nutrient', (error, results) => {
		  if (error) {
			console.error(error);
			res.sendStatus(500);
		  } else {
			const totalItems = results[0].total;
			res.json({ items, totalItems });
		  }
		});
	  }
	});
  });

  app.post('/redirect', (req, res) => {
	res.redirect('/table.html');
  });

  app.get('/authors', function (req, res) {
    // Execute a SELECT query to retrieve the authors data
    connection.query('SELECT * FROM authors', function (error, results) {
      if (error) throw error;
  
      // Send the data back to the client as a JSON object
      res.send(results);
    });
  });


  app.get("/dieticians/next", (req, res) => {
	// Get the id of the current dietician from the query string
	const currentId = parseInt(req.query.id);
  
	// Query the database for the next dietician
	connection.query(
	  "SELECT * FROM dietitian_list WHERE id > ? ORDER BY id ASC LIMIT 1",
	  [currentId],
	  (error, results) => {
		if (error) {
		  res.send(error);
		} else {
		  res.send(results[0]);
		}
	  }
	);
  });


 

//   form.addEventListener('submit', (event) => {
// 	// Prevent the default form submission behavior
// 	event.preventDefault();
  
// 	// Get the form data
// 	const formData = new FormData(form);
  
// 	// Build the INSERT statement
// 	const sql = 'INSERT INTO table (column1, column2, column3) VALUES (?, ?, ?)';
// 	const values = [formData.get('bf_totalGuests'), formData.get('bf_date'), formData.get('bf_time')];
  
// 	// Execute the INSERT statement
// 	connection.query(sql, values, (error, results) => {
// 	  if (error) throw error;
// 	  console.log('Form data added to the database');
// 	});
  
// 	// Close the connection
// 	connection.end();
//   });



app.get('/timeline', function (req, res) {
	const date = req.query.date;
	console.log(date);
    var userN= req.session.username;
	console.log(req.session.username);
	// console.log(session.username);
	// perform a query to select the date and description from the 'timeline' table
	// connection.query('SELECT date, description FROM timeline as t', function (error, results, fields) {

		connection.query('SELECT * FROM nutrient WHERE username = ? and date = ?',[userN, date], function(error, results) {
	// connection.query('SELECT date, description FROM timeline as t', function (error, results, fields) {
	  if (error) throw error;
	  
	  // loop through the results and print the date and description to the webpage
	  res.send(results);
	//   console.log(results);
	});
  });
  app.get('/timeline2', function (req, res) {
	
	const date = req.query.date;
    var userN= req.session.username;
	console.log(req.session.username);
	// console.log(session.username);
	// perform a query to select the d
	
	// connection.query('SELECT date, description FROM timeline as t', function (error, results, fields) {

		connection.query('SELECT * FROM food INNER JOIN nutrient on food.date1=nutrient.date and food.hours=nutrient.hours and food.min=nutrient.min and food.sec=nutrient.sec  and food.username=nutrient.username WHERE date1 =? and food.username= ?  ', [date, userN], function(error, results) {
	// connection.query('SELECT date, description FROM timeline as t', function (error, results, fields) {
	  if (error) throw error;
	  
	  // loop through the results and print the date and description to the webpage
	  res.send(results);
	//   console.log(results);
	});
  });
  

  app.post('/send-message', function(req, res) {
	var message = req.body.message;
	connection.query('INSERT INTO messages (message) VALUES (?)', [message], function(error, results) {
	  if (error) throw error;
	  res.send({
		success: true
	  });
	});
  });
  

  app.get('/messages', function(req, res) {
	connection.query('SELECT * FROM messages ORDER BY RAND() LIMIT 1', function(error, results) {
	  if (error) throw error;
	  res.send(results);
	});
  });


  app.get('/staff-members', (req, res) => {
	// SQL query to retrieve the list of staff members
	// const sql = 'SELECT name, photo, role FROM staff_members';
	const sql = 'SELECT name, image, role FROM dietitian_list';
	// Execute the query
	connection.query(sql, (error, results) => {
	  if (error) {
		console.log(error);
		res.status(500).json({ error });
	  } else {
		res.json(results);
	  }
	});
  });

  app.post('/store_nutrients', (req, res) => {
	// Extract the user nutrient requirements from the POST request body
	const userNutReq = req.body;
	console.log(userNutReq);
	const { age, sex, pregnantOrLactating, height, weight, lifestyle, reqCalories } = userNutReq;
  
	// Insert the userNutReq data into the database
	const query = `INSERT INTO user_nutrient_requirements (age, sex, pregnant_or_lactating, height, weight, lifestyle, calories, protein, total_fat, saturated_fat, cholesterol, carbohydrate, fiber, sugar, calcium, iron, magnesium, phosphorus, potassium, sodium, zinc, vitamin_a, vitamin_c, vitamin_d, vitamin_e, vitamin_k) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
	const values = [age, sex, pregnantOrLactating, height, weight, lifestyle, reqCalories, userNutReq.protein, userNutReq.totalFat, userNutReq.saturatedFat, userNutReq.cholesterol, userNutReq.carbohydrate, userNutReq.fiber, userNutReq.sugar, userNutReq.calcium, userNutReq.iron, userNutReq.magnesium, userNutReq.phosphorus, userNutReq.potassium, userNutReq.sodium, userNutReq.zinc, userNutReq.vitaminA, userNutReq.vitaminC, userNutReq.vitaminD, userNutReq.vitaminE, userNutReq.vitaminK];
  
	// Execute the INSERT query using a database library such as MySQL2
	connection.query(query, values, (error, results, fields) => {
	  if (error) {
		console.error(error);
		return res.status(500).send('Failed to store nutrients in the database');
	  }
	  return res.status(200).send('Successfully stored the nutrients in the database');
	});
  });
  
  app.post('/save-recipe', function (req, res) {
	// Get the recipe details from the request body
	var userN= req.session.username;
	var recipe = req.body.recipeName;
	
	// Insert the recipe into the database
	connection.query('INSERT INTO saved_recipe(username, name) values (?, ?)', [userN, recipe], function (error, results, fields) {
	if (error) throw error;
	res.send({ status: 'success' });
	});
	});
	
// const { MongoClient } = require("mongodb");
// // Replace the uri string with your MongoDB deployment's connection string.
// const uri =
// //   "mongodb+srv://<user>:<password>@<cluster-url>?retryWrites=true&writeConcern=majority";
//   "mongodb+srv://Arya:chir12321@cluster0.jqqwu8x.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri);
// async function run() {
//   try {
//     await client.connect();
//     const db = client.db("diet");
//     const coll = db.collection("db1");
// 	 const cursor = coll.find();
// 	await cursor.forEach(console.log);
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);
  
var MongoClient = require('mongodb').MongoClient;
var uri = "mongodb://Arya:aryaadesh29@ac-8gnc0br-shard-00-00.jqqwu8x.mongodb.net:27017,ac-8gnc0br-shard-00-01.jqqwu8x.mongodb.net:27017,ac-8gnc0br-shard-00-02.jqqwu8x.mongodb.net:27017/?ssl=true&replicaSet=atlas-hxm83g-shard-0&authSource=admin&retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run(userN) {
	try {
	  await client.connect();
	  const database = client.db("diet");
	  const ratings = database.collection("db1");
	  const cursor = ratings.find({"username": "arya_adesh"});
	  //Print every output from cursor
	//   await cursor.forEach(doc => console.dir(doc));
	await cursor.forEach(function(myDoc) {
		callParser(userN, myDoc.food, myDoc.date, myDoc.hour, myDoc.min,myDoc.sec);});
	await	ratings.deleteMany( { "username": "arya_adesh" } );

	} finally {
	  await client.close();
	}
  }
  const axios = require("axios");
  function callParser(userN,food,date,h,min,s) {
	
	const options = {
			method: 'GET',
			url: 'https://edamam-food-and-grocery-database.p.rapidapi.com/parser',
			params: {ingr: food},
			headers: {
			//   'X-RapidAPI-Key': '9a888c712fmshd6a59e5afce4431p1b173ejsn5eb12bfd7356',
			  'X-RapidAPI-Key': '29656971camsh2a3e15ab9c5b663p17c51fjsnc93507dc7deb',
			  'X-RapidAPI-Host': 'edamam-food-and-grocery-database.p.rapidapi.com'
			}
		  };
		  
		  axios.request(options).then(function (response) {
			 if(response.data.parsed !=null)
			 {
			//   {console.log("food: "+response.data.parsed[0].food.label+"; quantity: "+response.data.parsed[0].quantity+";  measure: "+response.data.parsed[0].measure.label);
			  connection.query('INSERT INTO food (username,hours,min,sec,food_name,quantity,unit,date1) VALUES (?,?,?,?,?,?,?,?)', [userN,h,min,s,
				response.data.parsed[0].food.label,
				response.data.parsed[0].quantity,
				response.data.parsed[0].measure.label,
				date], function(error, results) {
					console.log(results);
				callApi(userN,food,date,h,min,s,response.data.parsed[0].food.label);
			  });
			  
			 }

			else
			{
				const Array = food.split(" ");
				for(i=0;i<Array.length;i++)
				{
					console.log(Array[i]);
					var amount;
					const options2 = {
						method: 'GET',
						url: 'https://edamam-food-and-grocery-database.p.rapidapi.com/parser',
						params: {ingr: Array[i]},
						headers: {
						//   'X-RapidAPI-Key': '9a888c712fmshd6a59e5afce4431p1b173ejsn5eb12bfd7356',
						  'X-RapidAPI-Key': '29656971camsh2a3e15ab9c5b663p17c51fjsnc93507dc7deb',
						  'X-RapidAPI-Host': 'edamam-food-and-grocery-database.p.rapidapi.com'
						}
					  };

					  axios.request(options2).then(function (response2) {
						if(response2.data.parsed != null)
						{
							console("Inside if ");
							console.log(response2.data.parsed);
							const options3 = {
								method: 'GET',
								url: 'https://edamam-edamam-nutrition-analysis.p.rapidapi.com/api/nutrition-data',
								params: {ingr: food , 'nutrition-type': 'logging '},
								headers: {
								//   'X-RapidAPI-Key': '9a888c712fmshd6a59e5afce4431p1b173ejsn5eb12bfd7356',
								'X-RapidAPI-Key': '29656971camsh2a3e15ab9c5b663p17c51fjsnc93507dc7deb',
								  'X-RapidAPI-Host': 'edamam-edamam-nutrition-analysis.p.rapidapi.com'
								}
							  };
			  
							  axios.request(options3).then(function (response3) {
								amount=response3.data.totalWeight;
							  });

							connection.query('INSERT INTO food (username,hours,min,sec,food_name,quantity,unit,date1) VALUES (?,?,?,?,?,?,?,?)', [userN,h,min,s,
								response2.data.parsed[0].food.label,
								amount,
								"grams",
								date], function(error, results) {
								
							  });

							  callApi(userN,food,date,h,min,s,response2.data.parsed[0].food.label);
						}
				});
			}
		}
		  }).catch(function (error) {
			  console.error(error);
		  });
	
  }

  function callApi(userN,food,date,h,min,s, food_name)
  {
	var
	totalWeight,
	ENERC_KCAL,
	CHOCDF,
	FAT,
	PROCNT,
	FIBTG,
	SUGAR,
	CHOLE,
	NA,
	K, 
	FE,
	CA ,
	VITA_RAE,
	VITC,
	RIBF,
	WATER;
	
	
	
	const options = {
				  method: 'GET',
				  url: 'https://edamam-edamam-nutrition-analysis.p.rapidapi.com/api/nutrition-data',
				  params: {ingr: food , 'nutrition-type': 'logging '},
				  headers: {
				    // 'X-RapidAPI-Key': '9a888c712fmshd6a59e5afce4431p1b173ejsn5eb12bfd7356',
					'X-RapidAPI-Key': '29656971camsh2a3e15ab9c5b663p17c51fjsnc93507dc7deb',
				    'X-RapidAPI-Host': 'edamam-edamam-nutrition-analysis.p.rapidapi.com'
				  }
				};

				axios.request(options).then(function (response) {
					// console.log("weight"+ response.data.totalWeight+" g");
					// console.log("cal "+ response.data.totalNutrients.ENERC_KCAL.quantity+" "+response.data.totalNutrients.ENERC_KCAL.unit);
					// console.log("fat "+ response.data.totalNutrients.FAT.quantity+" "+response.data.totalNutrients.FAT.unit);
					// console.log("fib"+ response.data.totalNutrients.FIBTG.quantity+" "+response.data.totalNutrients.FIBTG.unit);
					totalWeight= response.data.totalWeight==null? 0:(response.data.totalWeight).toFixed(4);
					ENERC_KCAL= response.data.totalNutrients.ENERC_KCAL.quantity==null? 0.0000:(response.data.totalNutrients.ENERC_KCAL.quantity).toFixed(4);
					CHOCDF= response.data.totalNutrients.CHOCDF.quantity==null? 0.0000:(response.data.totalNutrients.CHOCDF.quantity).toFixed(4);
					FAT= response.data.totalNutrients.FAT.quantity==null? 0:(response.data.totalNutrients.FAT.quantity).toFixed(4);
					PROCNT= response.data.totalNutrients.PROCNT.quantity==null? 0.0000:(response.data.totalNutrients.PROCNT.quantity).toFixed(4);
					FIBTG= response.data.totalNutrients.FIBTG.quantity==null? 0.0000:(response.data.totalNutrients.FIBTG.quantity).toFixed(4);
					SUGAR= response.data.totalNutrients.SUGAR.quantity==null? 0.0000:(response.data.totalNutrients.SUGAR.quantity).toFixed(4);
					CHOLE= response.data.totalNutrients.CHOLE.quantity==null? 0.0000:(response.data.totalNutrients.CHOLE.quantity).toFixed(4);
					NA= response.data.totalNutrients.NA.quantity==null? 0.0000:(response.data.totalNutrients.NA.quantity).toFixed(4);
					K = response.data.totalNutrients.K.quantity==null? 0.0000:(response.data.totalNutrients.K.quantity).toFixed(4);
					FE= response.data.totalNutrients.FE.quantity==null? 0.0000:(response.data.totalNutrients.FE.quantity).toFixed(4);
					CA = response.data.totalNutrients.CA.quantity==null? 0.0000:(response.data.totalNutrients.CA.quantity).toFixed(4);
					VITA_RAE= response.data.totalNutrients.VITA_RAE.quantity==null? 0.0000:(response.data.totalNutrients.VITA_RAE.quantity).toFixed(4);
					VITC= response.data.totalNutrients.VITC.quantity==null? 0.0000:(response.data.totalNutrients.VITC.quantity).toFixed(4);
					RIBF= response.data.totalNutrients.RIBF.quantity==null? 0.0000:(response.data.totalNutrients.RIBF.quantity).toFixed(4);
					WATER= response.data.totalNutrients.WATER.quantity==null? 0.0000:(response.data.totalNutrients.WATER.quantity).toFixed(4);

					console.log("///////////////////////////////////////////////////");
					console.log(food);
					console.log((response.data.totalWeight).toFixed(4));
					console.log((response.data.totalNutrients.ENERC_KCAL.quantity).toFixed(4));
					console.log((response.data.totalNutrients.CHOCDF.quantity).toFixed(4));
					console.log((response.data.totalNutrients.FAT.quantity).toFixed(4));
					console.log((response.data.totalNutrients.PROCNT.quantity).toFixed(4));
					console.log((response.data.totalNutrients.FIBTG.quantity).toFixed(4));
					console.log((response.data.totalNutrients.SUGAR.quantity).toFixed(4));
					console.log((response.data.totalNutrients.CHOLE.quantity).toFixed(4));
					console.log((response.data.totalNutrients.NA.quantity).toFixed(4));
					console.log((response.data.totalNutrients.K.quantity).toFixed(4));
					console.log((response.data.totalNutrients.FE.quantity).toFixed(4));
					console.log((response.data.totalNutrients.CA.quantity).toFixed(4));
					console.log((response.data.totalNutrients.VITA_RAE.quantity).toFixed(4));
					console.log((response.data.totalNutrients.VITC.quantity).toFixed(4));
					console.log((response.data.totalNutrients.RIBF.quantity).toFixed(4));
					console.log((response.data.totalNutrients.WATER.quantity).toFixed(4));
					// console.log(response.data);
					connection.query('INSERT INTO nutrient VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [userN,date,h,min,s,food_name,
					totalWeight,
					ENERC_KCAL,
					CHOCDF,
					FAT,
					PROCNT,
					FIBTG,
					SUGAR,
					CHOLE,
					NA,
					K, 
					FE,
					CA ,
					VITA_RAE,
					VITC,
					RIBF,
					WATER,	
					], function(error, results) {
						// if (error) throw error;
					  });
				
				
				
				}).catch(function (error) {
					console.error(error);
				});
}
app.post('/manual', function(req, res) {
	var userN=req.session.username;
	var food= req.body.name;
	const now = new Date();
const year = now.getFullYear();
const month = (now.getMonth() + 1).toString().padStart(2, '0');
const day = now.getDate().toString().padStart(2, '0');
const hours = now.getHours().toString().padStart(2, '0');
const minutes = now.getMinutes().toString().padStart(2, '0');
const seconds = now.getSeconds().toString().padStart(2, '0');
const mysqlDate = now.toISOString().slice(0, 10);
console.log(mysqlDate);
    callParser(userN, food, mysqlDate, hours, minutes ,seconds);
  });


app.post('/save-recipe', function(req, res) {
	var userid = req.body.uid;
	var name = req.body.name;
	var webadd = req.body.webadd;
	connection.query('INSERT INTO saved_recipe (userid,name,webadd) VALUES (?,?,?)', [userid,name,webadd], function(error, results) {
	  if (error) throw error;
	  res.send({
		success: true
	  });
	});
  });

app.post('/upload',
    fileUpload({ createParentPath: true }),
    // filesPayloadExists,
    // fileExtLimiter(['.png', '.jpg', '.jpeg']),
    // fileSizeLimiter,
    (req, res) => {
        const files = req.files
        console.log(files)

        Object.keys(files).forEach(key => {
            const filepath = path.join(__dirname, 'files', files[key].name)
            files[key].mv(filepath, (err) => {
                if (err) return res.status(500).json({ status: "error", message: err })
            })
        })
		uploadimg(Object.keys(files).toString());
		return res.json({ status: 'success', message: Object.keys(files).toString()});
    }
)

const FormData = require("form-data");
const fs = require("fs");
// const axios = require("axios");

function uploadimg(path)
{

const data = new FormData();
// data.append("image", fs.createReadStream("C:/Users/6arya/Downloads/"+path));

const options = {
  method: 'POST',
  url: 'https://ocr-extract-text.p.rapidapi.com/ocr',
  headers: {
    'X-RapidAPI-Key': '9a888c712fmshd6a59e5afce4431p1b173ejsn5eb12bfd7356',
    'X-RapidAPI-Host': 'ocr-extract-text.p.rapidapi.com',
    ...data.getHeaders()
  },
  data: data
};

axios.request(options).then(function (response) {
	console.log(response.data);
	console.log(response.data.text);
	const regex = /(Calories)\s(\d+)\n./;
const match = regex.exec(response.data.text);
console.log(match[1]);
const calories = match[2];
console.log(calories);
const regex2=/(Protein)\s(\d+)g\n./ ;
const match2 = regex2.exec(response.data.text);
console.log(match2[1]);
const proteins = match2[2];
console.log(proteins);
// const proteins = match[4];
// console.log(calories);
// const vitaminA = match[7] === 'A' ? match[6] : 0;
// const vitaminC = match[7] === 'C' ? match[6] : 0;
// const vitaminD = 0;
// const vitaminE = 0;

// console.log({
//   calories,
// 	proteins});
//   vitaminA,
//   vitaminC,
//   vitaminD,
//   vitaminE,
// });
}).catch(function (error) {
	console.error(error);
});
}



app.get('/api/nutrient-information', function (req, res) {
	const date = req.query.date;
	console.log(date);
    var userN= req.session.username;
	console.log(req.session.username);
	// console.log(session.username);
	// perform a query to select the date and description from the 'timeline' table
	// connection.query('SELECT date, description FROM timeline as t', function (error, results, fields) {

		connection.query('SELECT * FROM nutrient where username = ? AND date = ?',[userN, date], function(error, results) {
	// connection.query('SELECT date, description FROM timeline as t', function (error, results, fields) {
	  if (error) throw error;
	  console.log(results);
	  // loop through the results and print the date and description to the webpage
	  res.send(results);
	//   console.log(results);
	});
  });


  app.get('/data', (req, res) => {
	connection.query('SELECT * FROM nutrient', (error, results) => {
	  if (error) {
		console.error(error);
		res.sendStatus(500);
	  } else {
		  console.log('Data sent');
		//   console.log(results);
		res.send({data: results});
		
	  }
	});
  });
  
  
  
  app.get('/data2', (req, res) => {
	const date=req.query.date;
	console.log(date)
	connection.query(`SELECT * FROM nutrient where date=?`,[date], (error, results) => {
	  if (error) {
		console.error(error);
		res.sendStatus(500);
	  } else {
		  console.log('Data sent');
		res.send({data: results});
		
	  }
	});
  });
  
  app.get('/data', function(request, response) {
	connection.query('SELECT * FROM nutrient', function(error, results, fields) {
	  if (error) {
		console.log('Error fetching data from MySQL database:', error);
		response.status(500).send('Error fetching data from MySQL database.');
	  }
	  else{
	  console.log('Data sent');
	  response.send(results);
	  }
	});
  });

  app.get("/myFunction", (req, res) => {
	var userN=req.session.username;
	run(userN);
	res.send("Function called from Node.js!");
  });

app.listen(3000);