const Cart = require("../models/Cart");

// Get Cart Items for a User
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user?.userId });
    if (!cart) return res.status(200).json({ books: [], totalAmount: 0 });

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add Book to Cart
exports.addToCart = async (req, res) => {
  try {
    const { bookId, title, author, price, thumbnail } = req.body;
    const userId = req.user?.userId; // Extract correct user ID from authenticated request

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access. User not found." });
    }

    // Check if required fields are provided
    if (!bookId || !title || !price) {
      return res.status(400).json({ message: "Book ID, title, and price are required" });
    }

    // Find user's cart
    let cart = await Cart.findOne({ userId });

    // If no cart exists, create a new one
    if (!cart) {
      cart = new Cart({ userId, books: [], totalAmount: 0 });
    }

    // Check if the book already exists in the cart
    const existingBook = cart.books.find((book) => book.bookId === bookId);

    if (existingBook) {
      existingBook.quantity += 1; // Increment quantity
    } else {
      cart.books.push({ bookId, title, author, price, thumbnail, quantity: 1 });
    }

    // Recalculate total amount
    cart.totalAmount = cart.books.reduce((total, book) => total + book.price * book.quantity, 0);

    // Save cart to database
    await cart.save();

    return res.status(200).json({ message: "Book added to cart", cart });

  } catch (err) {
    console.error("Error in addToCart:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Remove Book from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user?.userId; //Ensure `userId` is correctly extracted

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access. User not found." });
    }

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required" });
    }

    //Find user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    //Check if the book exists in cart
    const bookExists = cart.books.some((book) => book.bookId === bookId);
    
    if (!bookExists) {
      return res.status(404).json({ message: "Book not found in cart" });
    }

    //Remove the book
    cart.books = cart.books.filter((book) => book.bookId !== bookId);

    //Recalculate total amount
    cart.totalAmount = cart.books.reduce((total, book) => total + book.price * book.quantity, 0);

    await cart.save();

    res.status(200).json({ message: "Book removed from cart", cart });
  } catch (err) {
    console.error("Error in removeFromCart:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


// Update Book Quantity in Cart
exports.updateQuantity = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    const userId = req.user?.userId; // Ensure correct user extraction

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access. User not found." });
    }

    if (!bookId || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Book ID and valid quantity are required" });
    }

    // Find user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find book in cart
    const book = cart.books.find((b) => b.bookId === bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found in cart" });
    }

    // Update book quantity
    book.quantity = quantity;

    // Recalculate total amount
    cart.totalAmount = cart.books.reduce((total, book) => total + book.price * book.quantity, 0);

    await cart.save();

    res.status(200).json({ message: "Book quantity updated", cart });
  } catch (err) {
    console.error("Error in updateQuantity:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


// Clear Cart
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user?.userId }); //Use req.user.id
    res.json({ message: "Cart cleared successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
