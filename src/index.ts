import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import bodyParser from "body-parser";

const OAUTH_SERVER_TOKEN_URL = "https://www.integromat.dev/oauth/v2/token";

const CLIENT_ID = "6"; // replace with your client id
const CLIENT_SECRET = "e....d"; // replace with your client secret

// `https://www.integromat.dev/oauth/v2/authorize?client_id=6&redirect_uri=https://ad02-52-19-22-54.ngrok-free.app&response_type=code&scope=scenarios:run,scenarios:read,connections:read,connections:write,dlqs:read,user:read&code_challenge_method=S256&code_challenge=cZ6ulWkebryagJBjx9mw6Oq6g0m1YXfXFjiNt4ZoY7w`

const app: Express = express();
const port = 3000;

app.use(bodyParser.json());
app.use(morgan("combined"));

app.use((req, res, next) => {
  console.log("Body:", req.body);
  console.log("Query:", req.query);

  next();
});

app.get("/", async (req: Request, res: Response) => {
  const exchangeTokenBody = new URLSearchParams();
  exchangeTokenBody.append("grant_type", "authorization_code");
  exchangeTokenBody.append("code", req.query?.code as string);
  exchangeTokenBody.append("client_id", CLIENT_ID);
  exchangeTokenBody.append("client_secret", CLIENT_SECRET);
  exchangeTokenBody.append(
    "code_verifier",
    "mNtOAILRlb9h2LAGz2Z7IGQ02jY2Ne8o0rR5fgoEqmA" // code verifier for code_challenge=cZ6ulWkebryagJBjx9mw6Oq6g0m1YXfXFjiNt4ZoY7w
  );

  const tokenResponse = await fetch(OAUTH_SERVER_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: exchangeTokenBody,
  });

  const jsonResponse = await tokenResponse.json();

  res.send(`
    <h1>Redirected back to the client.</h1>
    <p>Client server contacted the OAuth server and exchanged tokens.<p>
    <hr />
    <h3>Token server response</h3>
    <p>(never visible to the actual user, server saves it somewhere to the database to use it later for server to server api communication)</p>
    <code>
     ${JSON.stringify(jsonResponse)}
    </code>  
  `);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
