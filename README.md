# Prisma Edge functions

> Modified from [prisma-edge-functions](https://github.com/ruheni/prisma-edge-functions). Thanks for their excellent work.

Edge functions are serverless functions at The Edge. They are written in JavaScript or TypeScript and run on a global network. It allows running server-side code geographically close to end users and enjoy lower latency.

This sample application shows how you can work with TiDB Cloud and edge functions. And here is a [live demo](https://vercel-edge-functions-prod.vercel.app/) build on vercel.


## Set up TiDB Cloud

1. Go to [TiDB Cloud](https://tidbcloud.com/) and create a serverless tier cluster.
2. Navigate to your serverless tier cluster's dashboard.
3. Click **Connect** to set a password, you can also build the prisma connect string with this pattern `mysql://USER:PASSWORD@HOST:PORT/edge_function?sslaccept=strict`.

![tidbcloud-connect.png](img/connect.png)

4. Connect to your serverless tier cluster and create a database named edge_function. This application will build on this database.
5. Create a setup user with only the privileges needed to migrate and seed `edge_function`. Keep this account separate from the read-only application user described below.

## Initialize the database

Initialize a new database before deploying locally, on Vercel, or on Netlify. Web builds only generate Prisma Client and compile the app.

1. Fork and clone this repository, then install dependencies before supplying database credentials:

   ```sh
   git clone https://github.com/${user_name}/nextjs-prisma-edge-example.git
   cd nextjs-prisma-edge-example
   npm ci --ignore-scripts
   ```

2. On a trusted machine or in a separate migration job, run setup with the setup user's direct TiDB connection string:

   ```sh
   export MIGRATE_DATABASE_URL='mysql://SETUP_USER:PASSWORD@HOST:PORT/edge_function?sslaccept=strict'
   npm run prisma:setup
   unset MIGRATE_DATABASE_URL
   ```

   This generates the direct database client, applies migrations, and seeds the quotes. Run it only once: seeding appends data. For later schema changes, supply the setup credential and run only `npm run prisma:migrate`. Retain migration output with the commit and operator, without logging credentials.

3. Create a separate user for the application's proxy connection. After creating it with its own password, grant only the read access the app needs:

   ```sql
   GRANT SELECT ON edge_function.Quote TO 'RUNTIME_USER'@'%';
   ```

   Replace `RUNTIME_USER` with the actual TiDB username, including its cluster prefix where applicable. Check that it has no write or schema privileges through other grants or roles.

## Set up Prisma Data Proxy

Edge environments only support HTTP-based connections. Therefore, we can not connect to TiDB Cloud which use long-lived TCP connections directly.

The Prisma Data Proxy is a proxy server for your database that allows you to interact with your database over HTTP, manages a connection pool, and ensures database connections are reused. It allows database access from Edge runtimes such as Vercel Edge Functions, Netlify Edge Functions and Cloudflare Workers.

1. sign in to the [Prisma Data Platform](https://cloud.prisma.io/) and click **New Project**.
2. Fill in the **Connection string** with the **read-only runtime user's** credentials, using this pattern: `mysql://RUNTIME_USER:PASSWORD@HOST:PORT/edge_function?sslaccept=strict`. Do not use the setup user's connection string.
3. Configure [TiDB Cloud firewall rules](https://docs.pingcap.com/tidbcloud/configure-serverless-firewall-rules-for-public-endpoints/) to allow only the proxy's outbound addresses and the trusted database setup environment. Enable static outbound IPs for the proxy where supported, and verify connectivity before removing broader rules.
4. Select a Data Proxy region that is geographically close to your TiDB Cloud cluster location. Then click **Create project**.

   ![prisma_project.png](img/prisma_project.png)

5. Click **Skip and continue to Data Platform** to go to the Data Platform.
6. Click **Data Proxy** in Data Platform, then click **Create a new connection string** to create a new connection string that starts with `prisma://`. Copy and save it for later use.

   ![proxy.png](img/proxy.png)

7. Click **Schema Viewer** in Data Platform, you can fill in the repository and click **Link Prisma schema** after you fork a repository. It is optional, if you don't link to your repository, prisma data proxy will sync the schema automatically by introspection mechanism.

   ![schema.png](img/schema.png)


<details>
  <summary><h2>Deploy on Local</h2></summary>

1. Complete [Initialize the database](#initialize-the-database) and [Set up Prisma Data Proxy](#set-up-prisma-data-proxy).

2. Optional: Link Prisma schema to the new repository you create. Follow [Set up Prisma Data Proxy](#set-up-prisma-data-proxy) step 7.
   
3. Set `DATABASE_URL` to the read-only Prisma Data Proxy connection string.

   ```sh
   export DATABASE_URL='prisma://aws-us-east-1.prisma-data.com/?api_key=YOUR_PROXY_KEY'
   ```

4. Generate Prisma Client that will connect through the Prisma Data Proxy using HTTP.

   ```sh
   npm run prisma:proxy
   ```
   
5. Start the app.

    ```
    npm run dev
    ```

🎉 Mission Completes.

The app is now running, navigate to http://localhost:3000/ in your browser to explore it.

</details>

<details>
  <summary><h2>Deploy on Vercel</h2></summary>

The Deploy button will take you through Vercel's project creation flow. Vercel will help to clone this job to your own GitHub repository and automatically deploy it.

First complete [Initialize the database](#initialize-the-database) and [Set up Prisma Data Proxy](#set-up-prisma-data-proxy).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftidbcloud%2Fnextjs-prisma-edge-example&env=DATABASE_URL&envDescription=Read-only%20Prisma%20Data%20Proxy%20connection%20string)

1. Click the **Deploy** button.
2. Click **GitHub** button and authenticate GitHub account.
3. Select your **Git Scope** and fill in **Repository Name** for your own GitHub repository.
4. Click **Create** to create the git repository.
5. Optional: Link Prisma schema to the new repository you create. Follow [Set up Prisma Data Proxy](#set-up-prisma-data-proxy) step 7.
6. Set `DATABASE_URL` to the read-only Prisma Data Proxy connection string. Do not add `MIGRATE_DATABASE_URL` to the hosting project.
7. Click **Deploy**.

🎉 Mission Completes.

Now wait for the deployment to complete, then you can view your site on the default domain generated by Vercel.

</details>

<details>
  <summary><h2>Deploy on Netlify</h2></summary>

The **Deploy to Netlify** button will take you to Netlify's deployment page. Then Netlify will help to clone this job to your own GitHub repository and automatically deploy it.

First complete [Initialize the database](#initialize-the-database) and [Set up Prisma Data Proxy](#set-up-prisma-data-proxy).

[![Deploy to Netlify button](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tidbcloud/nextjs-prisma-edge-example)

1. Click the **Deploy to Netlify** button.
2. Click **Connect to GitHub** and authenticate GitHub account.
3. Fill in **Repository name** for your own GitHub repository.
4. Set `DATABASE_URL` to the read-only Prisma Data Proxy connection string. Do not add `MIGRATE_DATABASE_URL` to the hosting project.
5. Click **Save & Deploy**.
6. [Optional]: Link Prisma schema to the new repository you create. Follow [Set up Prisma Data Proxy](#set-up-prisma-data-proxy) step 7.

🎉 Mission Completes.

Now wait for the deployment to complete, then you can view your site on the default domain generated by Netlify.

</details>

## Existing deployments

Before the next deployment, remove `MIGRATE_DATABASE_URL` and other setup credentials from every Vercel or Netlify environment. Repository changes do not delete saved hosting variables. Rotate previously hosted setup credentials and configure the proxy with the read-only application user.

Review dependency updates manually. Require PR approval and the CI build checks through branch protection. Limit deployment and migration access to maintainers, and use a separate database and proxy connection for previews.
