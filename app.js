const express=require("express");
const bodyParser=require("body-parser");
const request=require("request");
const _ = require("lodash");
var app=express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("Public"));



app.set('view engine', 'ejs');

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://arshsiddiqui:arshsiddiqui@cluster0-pld9s.mongodb.net/todolist_DB',{ useNewUrlParser: true });

var itemsSchema = new mongoose.Schema({
  // name: {
  // 	type : String,
  // 	 required: true},
  name : String,
});


var Item = mongoose.model('Item', itemsSchema);


var item1 = new Item({ name: 'buy food'
});

var item2 = new Item({ name: 'cook food'
});

var item3 = new Item({ name: 'eat food'
});


var defaultArray = [item1,item2,item3];

var listSchema = {
	name : String,
	items : [itemsSchema]
};

var List = mongoose.model('List', listSchema);






app.get("/",function(req,res){

	var today = new Date();
	
    var option={
		weekday:'long',
		year:'numeric',
		day:'numeric',
		month:'long'
	};

	var currentDay = today.toLocaleDateString("en-us" , option);

	Item.find({}, function(err, foundItems){
		if(foundItems.length === 0){
			Item.insertMany(defaultArray, function(err){
				if(err) {
					console.log(err);
				} else {
					console.log("successfully saved default items to DB");
				}
			});
            res.redirect("/");

		} else {

			res.render("list",{TitleList:"Today",newitems:foundItems });
		}


		
	});

});

	// Item.find({},function(err,item){
	//     if(err)
	// 		console.log(err);
	//     else
	//     	mongoose.connection.close();
	// 		console.log(item);

	// 		

	
	//res.render("list",{TitleList:"TTTTTtDay" ,newitems:items });
     
app.post("/",function(req,res){
	
	
	
	var itemName = req.body.newItem;
	var listName = req.body.list;
	var item = new Item({ name: itemName
    });

	if(listName === "Today"){

		item.save();

        res.redirect("/");

	} 
	else {
		List.findOne({name : listName}, function(err, result){
			result.items.push(item);
			result.save();
			res.redirect("/" + listName);
		    });
		
	}
    


});

app.post("/delete",function(req,res){
	var r = req.body.checkbox;
	var listName = req.body.listName;
	if(listName == "Today"){
		Item.findByIdAndRemove(r,function(err) {
        if (err)
        	console.log(err);
        else
        	console.log("Successfullt deleted the item");
            res.redirect("/");
        });

	} else {
		List.findOneAndUpdate(
			{name: listName},
			{$pull : {items:{_id: r}}}, function(err, foundList){
				if(!err){
					res.redirect("/" + listName);
				}

			}
		)
		
	}
	
    
});

app.get('/:customListName', function (req, res) {
	var customListName = _.capitalize(req.params.customListName);

    List.findOne({name : customListName}, function(err, result) {
     if (!err){
     	if(!result){
     		var list = new List({ name: customListName,
     	    items : defaultArray 
     	    });

             
        	list.save();
        	res.redirect("/" + customListName);

     	} else {

     		res.render("list", {TitleList:result.name,newitems:result.items });
     	}

     }
     
    
     		        
    });

    
    
});



 app.get("/aboutus",function(req,res){
 	res.render("aboutus");

 });

// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }


app.listen(process.env.PORT || 3000,function(){
	console.log("server is running at port 3000");
});

//This list only conatin home,work and about us list