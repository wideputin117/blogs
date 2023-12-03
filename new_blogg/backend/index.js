const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('./Admin');  
const { error } = require('console');

const app = express();
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:3000',  
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // 
};
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect('mongodb+srv://myAtlasDBUser:El1NwUeJZzAqvcpT@myatlasclusteredu.6e5ww98.mongodb.net/new_blogs?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });


async function createAdmin() {
  const adminExists = await Admin.exists({ username: 'admin' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('adminPassword', 10); // Hash the password
const newAdmin = new Admin({
      username: 'admin',
      password: hashedPassword,
    }); await newAdmin.save();
  }
}
createAdmin().catch(error => console.error('Error creating admin:', error));

// Define blog schema
const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  imageUrl: String,
  likes: Number,
  comments: [{ text: String, user: String }]
});

// this will be used to create new blogs
const Blog = mongoose.model('Blog', blogSchema);

// Authentication
function authenticateAdmin(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  jwt.verify(token.split(' ')[1], 'kHd7@3F9p2$jsL1!RqNw5GzE', (err, decoded) => {
    if (err) {                      // secret key = 'kHd7@3F9p2$jsL1!RqNw5GzE'
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.adminId = decoded.adminId;
    next();
  });
}

// Admin login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // Check username and password in database
  const admin = await Admin.findOne({ username });
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
const token = jwt.sign({ adminId: admin._id }, 'kHd7@3F9p2$jsL1!RqNw5GzE');
  res.json({ token });
});

// Create blog
app.post('/blogs', authenticateAdmin, async (req, res) => {
  const { title, content, imageUrl } = req.body;
  const newBlog = new Blog({
    title,
    content,
    imageUrl,
    likes: 0,
    comments: []
  });
  try{
  const savedBlog = await newBlog.save();
  res.status(201).json(savedBlog)}
  catch(err){
    console.error('Error creating the blog',err);
  };
});

// Get all blogs stored in database
app.get('/blogs', async (req, res) => {
  try{
  const blogs = await Blog.find();
  res.json(blogs);}
  catch(err){console.log("Error getting blogs", err)};
});

app.post('/blogs/:id/likes',authenticateAdmin,async(req,res)=>{
  const {id} = req.params;
  try{
    const blog = await Blog.findById(id);
    if(!blog){
      console.error("Likes not added",error);
      return res.status(404).json({message:"blog not found"});
    }
    blog.likes += 1;
    await blog.save();
  }
  catch(err){
    return res.sendStatus(500).json({message:'Likes not added'})}
  
  })
// update route
app.put('/blogs/:id', authenticateAdmin, async (req, res) => {
  const { title, content, imageUrl } = req.body;
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content, imageUrl },
      { new: true }
    );
    res.json(updatedBlog);
  } catch (err) {
    console.error('Error updating the blog', err);
    res.status(500).json({ message: 'Error updating the blog' });
  }
});

// delete route
app.delete('/blogs/:id', authenticateAdmin, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('Error deleting the blog', err);
    res.status(500).json({ message: 'Error deleting the blog' });
  }
});
 
 
// will check later why this is giving error
//app.use(express.static(path.join(__dirname, 'build')));

// Send index.html requests
/*app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});*/
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
