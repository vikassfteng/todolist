// jshint esversion:6
const exrpess = require("express");
const bodyParser = require("body-parser");
const app = exrpess();
const mongoose = require("mongoose");
const _ =require("lodash");  

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(exrpess.static("public"));
const url = 'mongodb://localhost:27017';

mongoose.connect("mongodb+srv://admin-vikas:project-1@cluster0.b4qze.mongodb.net/todolistdb", { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.connect("mongodb://localhost:27017todolistDB", { useNewUrlParser: true });

const itemsSchema = {
    name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todo list"
})

const item2 = new Item({
    name: "Hit the + button to add a new item"
})

const item3 = new Item({
    name: "<-- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3];
const listSchema = {
    name: String,
    items: [itemsSchema]
}
const List = mongoose.model("List", listSchema)

// Item.insertMany(defaultItems, function(err){
//     if (err){
//         console.log(err);
//     }
//     else{
//         console.log("successfully saved items to DB");

//     }
// })

app.get("/", function(req, res){

    // finding elements using mongoose and to check if array is empty  then add items
    // if array already contains items then array does not add same items again wehn staring server multiple times.
    Item.find({}, function(err, foundItems){


        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if (err){
                    console.log(err);
                }
                else{
                    console.log("successfully saved items to DB");
            
                }
            });
            res.redirect("/");
        }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
    })

});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, function(err, foundList){
        if (!err){
            if(!foundList)
            {
                // createlist
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/" + customListName);

            }else{
                // console.log("Exists!");
                // show an existing list
                res.render("List", {listTitle: foundList.name, newListItems: foundList.items})
            }
        }
    });
});
app.post("/", function(req, res){
const itemName = req.body.newItem;
const listName = req.body.list;
const item = new Item({
    name: itemName
})

if(listName === "Today"){
    
item.save();
res.redirect("/");
}
else 
{
    List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
    })
}
});
app.post("/delete", function(req, res){
   const checkedItemId =  req.body.checkbox;
   const listName = req.body.listName;
   if(listName === "Today"){

Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err){
        console.log("Successfully deleted checked item ");
        res.redirect("/");
    }
})
   }else{
       List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
           if (!err)
        {
            res.redirect("/"+listName);
        }
       })
   }

});

 
app.get("/work", function(req, res){
    res.render("list", {listTitle: "work List", newListItems: workItems});
})
app.get("/about", function(req, res){
     res.render("about");
});
       
    let port = process.env.PORT;
    if (port==null || port == ""){
        port=3000;
    }                                     
    
    app.listen(port, function () {
        console.log("3000 server started successfully");
        
    })