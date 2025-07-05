## Project Structure

```bash
.bolt/
    config.json
.gitignore
backend/
    .env
    middleware/
        auth.js
    models/
        Item.js
        Order.js
        OrderHistory.js
        User.js
    package.json
    routes/
        auth.js
        cart.js
        items.js
        orders.js
        users.js
    server.js
frontend/
    index.html
    package.json
    src/
        App.jsx
        components/
            Navbar.css
            Navbar.jsx
            PrivateRoute.jsx
        context/
            AuthContext.jsx
        index.css
        main.jsx
        pages/
            AddItem.jsx
            Cart.jsx
            Dashboard.jsx
            Deliveries.jsx
            ItemDetails.jsx
            Login.jsx
            Orders.jsx
            Profile.jsx
            Register.jsx
            SearchItems.jsx
            Support.jsx
            styling/
                AddItem.css
                Cart.css
                Deliveries.css
                ItemDetails.css
                Login.css
                Orders.css
                Profile.css
                Register.css
                SearchItems.css
                Support.css
    vite.config.js
README.md
```


## Setup Instructions

### Backend

1. Navigate to the backend directory:
    ```bash
    cd backend
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Create a [.env](http://_vscodecontentref_/45) file in the backend directory and add the following environment variables:
    ```
    RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
    GEMINI_API_KEY=your-gemini-api-key
    JWT_SECRET=your-jwt-secret
    MONGODB_URI=your-mongodb-uri
    ```

4. Start the backend server:
    ```bash
    npm run dev
    ```

### Frontend

1. Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Start the frontend development server:
    ```bash
    npm run dev
    ```

## Features

- **User Authentication**: Users can register and log in using their IIIT email addresses. CAPTCHA verification is implemented for security.
- **Item Listing**: Users can list items for sale, including details such as name, price, description, and category.
- **Cart Management**: Users can add items to their cart and remove them as needed.
- **Order Placement**: Users can place orders for items in their cart. OTP verification is required to complete the order.
- **Order Management**: Users can view their pending and completed orders. Sellers can view and manage their sold items.
- **Support Chat**: Users can interact with a support bot for assistance.

## Technologies Used

- **Frontend**: React, Vite, React Router, ReCAPTCHA
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs
- **Styling**: CSS

## Assumptions

- Items are of infinite quantity.
- actual payment is not done here
- we dont care how otp is sent from buyer to sender