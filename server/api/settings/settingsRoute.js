const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const mysqlQuery = require("../../database/connection/mysql_query");
const jwt = require("jsonwebtoken");

router.put("/edit", async (req, res) => {
  const { cardset_id, music, effect, card_animation } = req.body;
  const card = {
    1: true,
    2: true,
  };

  const token = req.cookies["token"];
  if (!token) return res.status(401).json("Unauthorized");
  const key = process.env.TOKEN_KEY;
  let decoded;
  let userId;

  try {
    decoded = jwt.verify(token, key);
    userId = decoded.id;
  } catch {
    return res.status(401).json("Unauthorized");
  }

  if (!card[cardset_id]) return res.status(400).json("invalid cardset_id");
  if (isNaN(music) || music < 0 || music > 100)
    return res.status(400).json("invalid music volume");
  if (isNaN(effect) || effect < 0 || effect > 100)
    return res.status(400).json("invalid effect volume");
  if (typeof card_animation !== "boolean")
    return res.status(400).json("invalid value of card animation");

  const userExistQuery = fs
    .readFileSync(
      path.join(__dirname, "../../database/queries/player_exists.sql")
    )
    .toString();

  const resp = await mysqlQuery(userExistQuery, [userId]);
  if (resp.length == 0) return res.status(404).json("user doesn't exist");

  const query = fs
    .readFileSync(
      path.join(__dirname, "../../database/queries/update_settings.sql")
    )
    .toString();

  await mysqlQuery(query, [cardset_id, music, effect, card_animation, userId]);

  return res.status(200).json("settings updated successfully");
});

router.get("/", async (req, res) => {
  const token = req.cookies["token"];
  if (!token) return res.status(401).json("Unauthorized");
  const key = process.env.TOKEN_KEY;
  let decoded;
  let userId;

  try {
    decoded = jwt.verify(token, key);
    userId = decoded.id;
  } catch {
    return res.status(401).json("Unauthorized");
  }

  const userExistQuery = fs
    .readFileSync(
      path.join(__dirname, "../../database/queries/player_exists.sql")
    )
    .toString();

  let resp = await mysqlQuery(userExistQuery, [userId]);

  if (resp.length == 0) return res.status(404).json("user doesn't exist");

  const query = fs
    .readFileSync(
      path.join(__dirname, "../../database/queries/get_settings.sql")
    )
    .toString();

  resp = await mysqlQuery(query, [userId]);
  if (resp.length == 0) return resp.sendStatus(204);
  return res.status(200).json(resp[0]);
});

module.exports = router;
