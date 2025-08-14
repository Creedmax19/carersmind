# Accept a Payment with Stripe Checkout

Stripe Checkout is the fastest way to get started with payments. Included are some basic build and run scripts you can use to start up the application.

## Set Price ID

In the back end code, replace `price_1RvIzyAbgyHA5Xcovgow97xz` with a Price ID (`price_xxx`) that you created.

## Running the sample

1. Build the server

~~~
npm install
~~~

2. Run the server

To run in production mode:
~~~
npm start
~~~

To run in development mode (recommended for local development):
~~~
npm run dev
~~~

3. Go to [http://localhost:4242/checkout.html](http://localhost:4242/checkout.html)

## Port Configuration

The application is configured to run on port 4242:
- Server.js is explicitly configured to listen on port 4242
- The YOUR_DOMAIN constant in server.js points to localhost:4242
- Both start and dev scripts in package.json use port 4242

Note: If you're seeing the server run on port 5002 when using `npm run dev`, this may be due to an external development tool or IDE configuration. We recommend:
1. Using the official dev script that runs on port 4242
2. If you need to use port 5002, update the YOUR_DOMAIN constant in server.js accordingly
3. Document any external tooling that sets port 5002 in your development environment documentation