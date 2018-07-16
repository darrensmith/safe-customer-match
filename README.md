About
=======

safe-email-match will hash each email contained within a CSV file containing the local email database according to a specified algorithm and then match the hashes against a third party CSV file containing hashed email addresses. It will output a CSV of the common hashes / email addresses. 

the application can also be used to generate the initial third party hash CSV.

Usage
=====

- Install NodeJS on your computer (follow instructions at https://nodejs.org/en/download/)
- Unzip this compressed file in to a new folder on your computer
- Navigate to that folder in the terminal and type "npm install" to install all dependencies

- User who is sharing their email hashes must then obtain a dump of emails (or phone numbers, ABNs etc) from their database in CSV format with one email record per line. Call the file local1.csv and save in the email-db folder
- Navigate to the root folder for this app in the terminal and type "node --max_old_space_size=4096 safe-email-match.js generate ./email-db/local1.csv ./email-db/hashes.csv SALT" (replacing SALT with any string of your choice)
- After this runs, grab the "hashes.csv" file and share with the other company's user via email or any means.

- The user who accepts "hashes.csv" must then install this same application and drop "hashes.csv" in to the email-db folder
- They should also obtain a dump of their email addresses (or phone nnumbers, ABNs, etc) from their database in CSV format with one email record per line and call it local2.csv, saving in to same email-db folder
- Navigate to the root folder for this app in the terminal and type "node --max_old_space_size=4096 safe-email-match.js match ./email-db/local2.csv ./email-db/hashes.csv ./email-db/output.csv SALT" (replacing SALT with the same salt string used by first user)
- "output.csv" should be created. This contains a list of email addresses that appear in both databases (without showing either party the other's entire list of email addresses, ABNs, phone numbers or other strings of choice)