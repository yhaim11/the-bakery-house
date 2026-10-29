Project Specification: "The Bakery House"
Status: Version 1.0 - Full Architectural Specification

1. Overview & Total Isolation (Isolation & Architecture)
Application Name: "The Bakery House" (בית האפיות).

Complete Isolation: The application will be built within a completely dedicated folder in Google Drive with an independent code structure (completely separate scripts, data, and style files), ensuring no collisions or mixing with previous confectionery management applications.

Infrastructure: A Single Page Application (SPA) based purely on HTML5, CSS3, and JavaScript (ES6+), featuring local data storage (localStorage) and managed synchronization to Netlify.

2. Core Modules in the Application
A. The Smart Baker's Calculator (The Baker's Engine)
Target Input: Input by total flour weight or by number of units (loaves, challahs, rolls) with an average weight per unit.

Full Sourdough & Weather Management:

Sourdough Type & Feeding: Selection of stiff starter (Pasta Madre - 50% hydration) or liquid starter (100%), feeding quantity definition, flexible ratios (such as 1:1:2 or free feeding), and daily frequency.

Flour Batch Inventory Management & Alerts: Automated tracking and inventory depletion per feeding according to the flour type (rye, manitoba, etc.), including early red alerts (even outside the app) when only the final feeding remains.

Weather & Environment Sensor: Smart recommendations for starter placement (cool or warm environment) based on local weather and environmental conditions.

Smart Fermentation Log & Batches: Tracking dough temperature, real-time rise percentage, and separate inventory management for various flour types.

Free Baking Mode: Input custom quantities of flour, hydration, salt, and rich additions (oil, eggs, milk, butter), including a safety engine and sanity check for standard baking parameters with warnings for anomalies and user confirmation, alongside automatic inventory updates in the system.

Precise Calculation Engine & Hybrid Pastries: Automatic Baker's Percentages calculation that deducts the water and flour coming directly from the sourdough starter itself, supporting combined baking modes of commercial yeast and sourdough together.

B. Recipes Arsenal & Categories (Recipes Arsenal)
Dynamic Database (recipes.json): Detailed recipes including photos, proofing times, meticulous preparation steps, and professional tips.

Subscription Tiers:

Free Version: Access to basic recipes, basic baker's calculator, and community.

Pro Version: Full sourdough management, weather sensor, fermentation log, advanced free baking, and offline recipe downloads.

Pantry & Personal Inventory Management (Bonus): Option to filter recipes based on flour types currently available in the user's home (e.g., Manitoba, Spelt, Rye).

C. Bakers Community & Live Group Chat (Bakers Community)
Live Shared Chat: A communal space for real-time questions, shares, and consultations for all community members.

Replies & Mentions System: Full support for replies and user tagging (Mentions).

No Direct Chats: Private conversations are not supported at this stage, to maintain simplicity, privacy, and user security.

D. Users, Security, Privacy & Administration (Users, Privacy & Admin)
Registration & Login: Authentication via email and password against "Keshet's Kennel" infrastructure.

Personal Area: User profile including profile picture and a customized timer for the next sourdough feeding.

Absolute Security & Privacy: Complete hiding of email addresses and phone numbers between users. The community displays a unique Nickname, a subjective profile picture, and an optional title only.

Super Admin Permissions: Full access to all data, subscription management, content, and payments is restricted exclusively to the Super Admin.

3. Project File Structure in Drive
index.html – Complete UI structure (login screens, calculator, recipe list, premium area, and management panel).

style.css – Clean design, full RTL support, optimized for mobile and touch screens (Touch-first).

app.js – Application logic, baker's calculation engine, localStorage state management, and timer management.

recipes.json – Full database of all recipes and their tags.

deploy_bakery_house.gs – Automated script for direct site updates to Netlify under a dedicated project URL.
