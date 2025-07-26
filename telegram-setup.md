# 🤖 Telegram Mini App Setup Guide

## Step 1: BotFather se Bot Banao

1. **Telegram pe @BotFather search karo**
2. **Start command send karo**
3. **/newbot command send karo**
4. **Bot name**: `Idea Marketplace`
5. **Bot username**: `your_idea_marketplace_bot` (unique hona chahiye)
6. **Bot token mil jayega** - save karo!

## Step 2: Mini App Setup

1. **@BotFather pe /newapp command send karo**
2. **Bot select karo**
3. **App title**: `Idea Marketplace`
4. **App short description**: `Buy and sell innovative startup ideas`
5. **App description**: `A Web3 marketplace for innovative startup ideas. Submit your ideas or purchase exclusive access to groundbreaking concepts.`
6. **App photo**: Upload a nice icon
7. **App URL**: `https://your-deployed-url.netlify.app` (deploy ke baad)

## Step 3: Commands Setup

BotFather pe yeh commands add karo:

```
start - Start the Idea Marketplace
submit - Submit a new idea
browse - Browse available ideas
my_ideas - View your submitted ideas
help - Get help
```

## Step 4: Web App URL

Jab deploy ho jaye, to BotFather pe `/setmenubutton` command use karo:
- Bot select karo
- Menu button text: `Open Marketplace`
- Web app URL: `https://your-deployed-url.netlify.app`

## Bot Token Example
```
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

## Mini App URL Example
```
https://your-app-name.netlify.app
``` 