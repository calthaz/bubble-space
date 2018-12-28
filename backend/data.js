// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
const BubbleSchema = new Schema(
  {
    id: Number,
    coord:[Number], 
    title: String,
    date: String,
    situation: String,
    thoughts: String,
    feelings: String,
    tags: [String],
    active: Boolean
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Bubble", BubbleSchema);
//Mongoose by default produces a collection name by passing the model name to the utils.toCollectionName method. 
//This method pluralizes the name. Set this option if you need a different name for your collection.
//aka "datas"