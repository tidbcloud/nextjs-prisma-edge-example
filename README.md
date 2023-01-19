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

## Set up Prisma Data Proxy

Edge environments only support HTTP-based connections. Therefore, we can not connect to TiDB Cloud which use long-lived TCP connections directly.

The Prisma Data Proxy is a proxy server for your database that allows you to interact with your database over HTTP, manages a connection pool, and ensures database connections are reused. It allows database access from Edge runtimes such as Vercel Edge Functions, Netlify Edge Functions and Cloudflare Workers.

1. sign in to the [Prisma Data Platform](https://cloud.prisma.io/) and click **New Project**.
2. Fill in the **Connection string** with this pattern `mysql://USER:PASSWORD@HOST:PORT/edge_function?sslaccept=strict`. You can find the connection information in your [TiDB Cloud console](https://tidbcloud.com/console/clusters).
3. Leave the **Static IPs** as disabled because TiDB Cloud Serverless Tier is accessible from any IP address.
4. Select a Data Proxy region that is geographically close to your TiDB Cloud cluster location. Then click **Create project**.

   ![prisma_project.png](img/prisma_project.png)

5. Click **Skip and continue to Data Platform** to go to the Data Platform.
6. Click **Data Proxy** in Data Platform, then click **Create a new connection string** to create a new connection string that starts with `prisma://`. Copy and save it for later use.

   ![proxy.png](img/proxy.png)

7. Click **Schema Viewer** in Data Platform, you can fill in the repository and click **Link Prisma schema** after you fork a repository. It is optional, if you don't link to your repository, prisma data proxy will sync the schema automatically by introspection mechanism.

   ![schema.png](img/schema.png)


<details>
  <summary><h2>Deploy on Local</h2></summary>

1. Fork this repository and clone it to your local machine.
    
    ```
    git clone https://github.com/${user_name}/nextjs-prisma-edge-example.git
    cd nextjs-prisma-edge-example
    ```

2. Optional: Link Prisma schema to the new repository you create. Follow [Set up Prisma Data Proxy](#how-to-set-up-prisma-data-proxy) step 7.
   
3. Set DATABASE_URL environment variables.

    ```
    export DATABASE_URL=mysql://<User>:<Password>@<Endpoint>:<Port>/edge_function?sslaccept=strict
    ```

4. apply prisma migrate and seed.

    ```
    npx prisma migrate deploy
    npx prisma db seed
    ```

5. Replace the `DATABASE_URL` with the connection string you got from Prisma Data Platform.

   ```
   export DATABASE_URL=DATABASE_URL=prisma://aws-us-east-1.prisma-data.com/?api_key=•••••••••••••••••
   ```

6. Generate Prisma Client that will connect through the Prisma Data Proxy using HTTP.

   ```
   npx prisma generate --data-proxy
   ```
   
7. Start the app.

    ```
    npm run dev
    ```

🎉 Mission Completes.

The app is now running, navigate to http://localhost:3000/ in your browser to explore it.

</details>

<details>
  <summary><h2>Deploy on Vercel</h2></summary>

The Deploy button will take you through Vercel's project creation flow. Vercel will help to clone this job to your own GitHub repository and automatically deploy it.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftidbcloud%2Fnextjs-prisma-edge-example&env=MIGRATE_DATABASE_URL,DATABASE_URL&envDescription=TiDB%20Cloud%20and%20prisma%20data%20proxy%20connect%20string%20)

1. Click the **Deploy** button.
2. Click **GitHub** button and authenticate GitHub account.
3. Select your **Git Scope** and fill in **Repository Name** for your own GitHub repository.
4. Click **Create** to create the git repository.
5. Optional: Link Prisma schema to the new repository you create. Follow [Set up Prisma Data Proxy](#how-to-set-up-prisma-data-proxy) step 7.
6. Enter the environment variables:
   - `MIGRATE_DATABASE_URL`: the tidb cloud connection string.
   - `DATABASE_URL`: the Prisma Data Proxy connection string.
7. Click **Deploy**.

![img/vercel.png](img/vercel.png)

🎉 Mission Completes.

Now wait for the deployment to complete, then you can view your site on the default domain generated by Vercel.

</details>

<details>
  <summary><h2>Deploy on Netlify</h2></summary>

The **Deploy to Netlify** button will take you to Netlify's deployment page. Then Netlify will help to clone this job to your own GitHub repository and automatically deploy it.

[![Deploy to Netlify button](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tidbcloud/nextjs-prisma-edge-example)

1. Click the **Deploy to Netlify** button.
2. Click **Connect to GitHub** and authenticate GitHub account.
3. Fill in **Repository name** for your own GitHub repository.
4. Enter the environment variables:
   - `MIGRATE_DATABASE_URL`: the tidb cloud connection string.
   - `DATABASE_URL`: the Prisma Data Proxy connection string.
5. Click **Save & Deploy**.
6. [Optional]: Link Prisma schema to the new repository you create. Follow [Set up Prisma Data Proxy](#how-to-set-up-prisma-data-proxy) step 7.

![img/netlify.png](img/netlify.png)

🎉 Mission Completes.

Now wait for the deployment to complete, then you can view your site on the default domain generated by Netlify.

</details>