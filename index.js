import dotenv from "dotenv";
dotenv.config({
  path: './.env',
});
import { connecttodb } from "./configration/database.js";
import { app } from "./server.js";



 connecttodb()
  .then((data) => {
    
  
    app.listen(process.env.PORT || 4000, () => {
      console.log("app is running on port", process.env.PORT);

    });
    
  })
  .catch((err) => {
    console.error("❌ Could not connect to DB, shutting down...");
    console.error(err.message);
    process.exit(1);
  });

  
  



