# Teknisk information
## Ramverk och bibliotek
- React
- Tailwind
- ASP.NET Core Web API
- MySQL
- SignalR 

## Annat
- Frontend körs på [http://localhost:5173](http://localhost:5173)
- Backend körs på [http://localhost:5296](http://localhost:5296)
- Använder RESTful API.
- Använder JWT-token för autentisering.

# Appbyggande
## Nödvändiga installationer
- .NET 8 eller 9
- Node.js & npm
- MySQL

## Databas
- Skapa en SQL connection på localhost:3306.
- Gå in på "appsettings.json" i backend-mappen.
- Ha en MySQL databas redo
- I strängen "DefaultConnection", ändra "User" till din connections användarnamn och "Password" till din connections lösenord.
- Sätt en secretkey till minst 32 tecken.

## AI
 - Behöver en OpenAI ApiKey i Program.cs rad 29

## Starta Applikationen
 - Skapa 2 terminaler, en för backend, en för frontend
 - cd backend
    dotnet restore
    dotnet ef database update
    dotnet run

 -cd frontend
    npm install
    npm run dev


 ## Använda AI funktionen
 - Logga in med admin behörigheter:
 **E-post: admin@innoviahub.com**, <br />
 **Lösenord: Admin123!**
 - Klicka på nlå Cirkel i nedre högra hörnet
 - Fråga ai på detta sätt: **Can you book Desk #1?**
 - Kanske behöver starta om backenden men borde registrera direkt.

## Att tänka på
 - UserId är hårdkodad i ChatController.cs rad 45, kanske behöver byta ut den.
 - Nu lyser Program.cs rött med **The type or namespace name * could not be found (are you missing a using directive or an assembly reference?)** problem men verkar         fortfarande  funka för mig.
 - 

