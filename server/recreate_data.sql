BEGIN TRANSACTION;
DROP TABLE IF EXISTS "sitetitle";
DROP TABLE IF EXISTS "blocks";
DROP TABLE IF EXISTS "pages";
DROP TABLE IF EXISTS "users";

CREATE TABLE IF NOT EXISTS "sitetitle" (
	"id"			INTEGER PRIMARY KEY,
	"title"			TEXT
);

INSERT INTO "sitetitle" VALUES (1, "CMSmall");

CREATE TABLE IF NOT EXISTS "users" (
	"id"	        	INTEGER PRIMARY KEY AUTOINCREMENT,
	"username"			TEXT,
	"name"	        	TEXT,
    "admin"				TEXT,
	"hash"	        	TEXT,
    "salt"          	TEXT
);

INSERT INTO "users" VALUES (1, 'testuser01@polito.it', 'testUser01', 0,  "27867a6376dfab29404fc6f06b8641e0c430748c0188e21a5ad16a1f86651678", "e869822f0e705022");
INSERT INTO "users" VALUES (2, 'testuser02@polito.it', 'testUser02', 0,  "2bc4268bf6d8824dce6a9129ea039f47afb2b8e7d0a453e3821d9fda3a8a8376", "f00ebc4635348aaf");
INSERT INTO "users" VALUES (3, 'testuser03@polito.it', 'testUser03', 0,  "155de7f5d277510a34ac77d4778230ffc463cabbaf5b18e6b66df32d922242e8", "b42014d24fd622bf");
INSERT INTO "users" VALUES (4, 'testadmin0@polito.it', 'adminUser0', 1, "d9e12c8cf85966b9eb44172453cb0406b5e8fe8c8923569400ebf3aaf89e83b0", "4f59b34e5ab694a2");

CREATE TABLE IF NOT EXISTS "pages" (
	"id"	        	INTEGER PRIMARY KEY AUTOINCREMENT,
	"userid"        	INTEGER NOT NULL,
	"title"	        	TEXT,
    "author"        	TEXT,
	"creationdate"		DATE NOT NULL,
	"publicationdate"	DATE,
    FOREIGN KEY("userid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "pages" VALUES (1, 1, 'Toyger, il gatto tigre', 'testUser01', '2023-06-23', '2023-06-23');
INSERT INTO "pages" VALUES (2, 1, 'La via delle orecchiette: il vicolo più autentico di Bari', 'testUser01', '2023-06-23', '2023-06-24');
INSERT INTO "pages" VALUES (3, 2, 'testPage03', 'testUser02', '2023-06-23', NULL);
INSERT INTO "pages" VALUES (4, 2, 'testPage04', 'testUser02', '2023-06-23', NULL);
INSERT INTO "pages" VALUES (5, 4, 'testPage05', 'adminUser0', '2023-06-23', '2023-12-25');
INSERT INTO "pages" VALUES (6, 4, 'testPage06', 'adminUser0', '2023-06-23', '2023-08-14');

CREATE TABLE IF NOT EXISTS "blocks" (
	"id"	        	INTEGER PRIMARY KEY AUTOINCREMENT,
	"pageid"        	INTEGER NOT NULL,
	"index"				INTEGER NOT NULL,
	"type"	        	TEXT,
    "content"       	TEXT,
    FOREIGN KEY("pageid") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "blocks" VALUES (1,  1, 0, "header", "Il gatto Toyger è una razza molto recente, la cui selezione è iniziata a partire dagli anni 80. La caratteristica principale di questa giovane razza è la tipica striatura del manto che ricorda quella di una tigre. È un gatto molto attivo che necessita di spazi e tempi necessari a soddisfare la sua propensione predatoria. Vediamo quali sono tutte le sue caratteristiche e che temperamento ha.");
INSERT INTO "blocks" VALUES (2,  1, 1, "image", "http://localhost:3001/static/toyger.webp");
INSERT INTO "blocks" VALUES (3,  1, 2, "paragraph", "Il Toyger, una parola nata dalla contrazione di “toy“ (giocattolo) e “tiger” (tigre), ovvero “tigre giocattolo”, è un gatto di dimensioni medie la cui selezione è iniziata negli anni '80 con l'obiettivo di ricalcare il mantello di una tigre, dando estrema importanza al disegno delle striature e alla pancia chiara. È allevata prevalentemente negli Stati Uniti ed è una delle razze più giovani oggi esistenti.");
INSERT INTO "blocks" VALUES (4,  1, 3, "paragraph", "Fonte: https://www.kodami.it/toyger-laffidabile-gatto-tigre/");

INSERT INTO "blocks" VALUES (5,  2, 0, "image", "http://localhost:3001/static/bari01.webp");
INSERT INTO "blocks" VALUES (6,  2, 1, "paragraph", "Bari è stata una delle città che più ci è rimasta nel cuore durante il nostro viaggio on the road in Puglia. Ciò che abbiamo amato di lei è stata la sua gente, così pura e così autentica. Per questo, se volete conoscere la vera Bari non potete perdervi una visita alla via dell'Arco Basso, conosciuta meglio come Via delle Orecchiette.");
INSERT INTO "blocks" VALUES (7,  2, 2, "image", "http://localhost:3001/static/bari02.webp");
INSERT INTO "blocks" VALUES (8,  2, 3, "header", "Come raggiungere la Via delle Orecchiette");
INSERT INTO "blocks" VALUES (9,  2, 4, "paragraph", "Nel cuore di Bari Vecchia, fra i suoi vicoli rumorosi esiste un luogo nascosto, dove passato e presente si mischiano per dare vita ad un'atmosfera senza tempo. Attraversato l'arco basso, lascerete alle vostre spalle il Castello Normanno-Svevo ed entrerete in un luogo fatto di donne, colori e orecchiette. E anche se vi troverete in una città in cui non siete mai stati, in un attimo vi sentirete subito a casa.");
INSERT INTO "blocks" VALUES (10, 2, 5, "image", "http://localhost:3001/static/bari03.webp");
INSERT INTO "blocks" VALUES (11, 2, 6, "paragraph", "La via delle orecchiette ha reso Bari famosa in tutto il mondo. Ma le vere protagoniste sono le donne baresi, che con le loro abili mani creano migliaia di orecchiette al giorno, sedute di fronte ai loro tavoli di legno. Sono loro a regalare a chiunque passi uno spettacolo che incanta e che riproduce una delle tradizioni più importanti del nostro paese.");
INSERT INTO "blocks" VALUES (12, 2, 7, "image", "http://localhost:3001/static/brace_accesa.jpg");
INSERT INTO "blocks" VALUES (13, 2, 8, "paragraph", "Fonte: https://soloviaggiumili.it/alla-scoperta-della-via-delle-orecchiette-a-bari/");

INSERT INTO "blocks" VALUES (14, 3, 0, "header", "testHeader03");
INSERT INTO "blocks" VALUES (15, 3, 1, "paragraph", "testParagraph03");

INSERT INTO "blocks" VALUES (16, 4, 0, "header", "testHeader04");
INSERT INTO "blocks" VALUES (17, 4, 1, "image", "testImage01");

INSERT INTO "blocks" VALUES (18, 5, 0, "header", "testHeader05");
INSERT INTO "blocks" VALUES (19, 5, 1, "image", "testImage02");

INSERT INTO "blocks" VALUES (20, 6, 0, "header", "testHeader06");
INSERT INTO "blocks" VALUES (21, 6, 1, "image", "testImage03");

PRAGMA foreign_keys=ON;

COMMIT;
