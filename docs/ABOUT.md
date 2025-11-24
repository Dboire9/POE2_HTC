# 👤 About me & POE2 How To Craft

## 👨‍💻 About the Developer

### 🙋‍♂️ Who Am I?

Hi! I'm **Dorian Boiré** ([@Dboire9](https://github.com/Dboire9)), a passionate software developer currently in my third year at 42 Paris, after starting my journey at 42 Angoulême.
Before that, I graduated in Applied Foreign Languages (English and Spanish) and spent one year in Spain working as a receptionist in a five-star hotel.
I’m now based in Paris and actively seeking an internship in software development or freelance opportunity, as my school requires professional experience for graduation.
I started playing POE1 some years ago and have been fascinated by its complex crafting system ever since, while (still) not being very good at it.

### 💡 Why I Built This

**✨ The Inspiration:**

As said before, I have been playing Path of Exile on and off since a few years now. With the early access of Path of Exile 2, I was excited to dive into the new (and more accessible) crafting system.
Since POE2 launched, I found myself being very interested in the new crafting system, as it was much simpler than POE1, as I thought that POE1 has a very steep learning curve for new players.

I also did watched a lot of [thefarmer](https://www.twitch.tv/xthefarmerx), and I liked a lot his approach of the game, only doing crafts to profit off of it.
I had the idea of doing this project when I saw him think about the best way of doing some items to profit craft, while having [POE2db](https://poe2db.tw/) opened and trying to manually piece together the best way of doing it during hours.

While it was fun to watch him do it, I thought that there had to be a better way of doing it, and as a software developer, I thought that I could build a tool to help with that.
It so happened that I was also looking for an internship at that time and Java was a language that was in demand, so I thought that building a project like this would be a great way to showcase my skills and learn Java.

**🎯 The Challenge:**

Building this tool was a fascinating technical challenge:
- Modeling the entire crafting system in code (I did a lot of copy and paste from poe2db’s crafting data)
- Implementing efficient search algorithms (Beam Search) (Took me nearly 2 months and lots of headscratching to get it right and efficient)
- Calculating accurate probabilities for complex sequences
- Designing an intuitive UI for a complex problem (Well the UI is mostly AI I won't lie)
- Optimizing performance for real-time results (I needed to find ways to reduce the computing time to make it usable, as not doing that filled the heap memory very quickly)

**🎖️ The Goal:**

My goal was to create a tool that:
1. **Helps players make informed decisions** - Know the odds before you start
2. **Reduces frustration** - Stop wasting currency on impossible crafts
3. **Saves time** - Focus on playing, not on guessing
4. **Gives back to the community** - Open source for everyone to use and improve

### 🎓 My Background

**💻 Technical Skills:**
- Software Engineering (C, C++, Python, Docker, Java, TypeScript, React)
- Algorithm Design and Optimization
- Full-Stack Development
- Desktop Application Development (Electron)

### 📚 What I Learned

This project taught me:
- **Algorithm optimization** - Balancing accuracy vs. performance
- **Domain modeling** - Translating game mechanics into code
- **User experience** - Making complex systems accessible
- **Open source collaboration** - Working with community contributors
- **Full-stack development** - Connecting Java backend with React frontend

---

## 🎮 About the Project

**POE2 How To Craft** is a crafting optimization tool designed to help Path of Exile 2 players find the most efficient paths to craft their desired items. This tool uses advanced algorithms to calculate optimal crafting sequences and their success probabilities.

### ⚠️ The Problem

Crafting in Path of Exile is notoriously complex:
- Dozens of possible modifiers per item type
- Multiple crafting currencies with different behaviors
- Exponential combinations (6 modifiers and their tiers = millions of possible paths)
- No in-game guidance on optimal strategies
- Extremely expensive trial-and-error learning

Players often waste thousands of Exalted Orbs and hours of gameplay trying to craft their perfect items without knowing if their approach is even viable.

### ✅ The Solution

This application:
- **Calculates exact probabilities** for any crafting goal
- **Finds optimal paths** using a modified Beam Search algorithm
- **Provides step-by-step instructions** for in-game execution
- **Saves time and currency** by eliminating guesswork
- **Educates players** about crafting mechanics and strategies

### ⚡ Key Features

- **Comprehensive item database** covering all craftable items
- **Smart modifier selection** with family conflict detection
- **Real-time simulation** with results in 3-8 seconds
- **Multiple path suggestions** ranked by probability
- **Desktop application** with auto-update support
- **Open source** and community-driven

---

## 🌟 Project Philosophy

### 🔓 Open Source First

I believe powerful tools should be accessible to everyone. By making this project open source:
- **Transparency** - Everyone can see how it works
- **Community contributions** - Collective improvement
- **Learning resource** - Others can learn from the code
- **Trust** - No hidden mechanics or paid features

### 🤝 Community-Driven

The PoE community is incredible, and this tool is built for them:
- **User feedback shapes development** - Features based on real needs
- **Community data updates** - Players help keep modifier data current
- **Shared knowledge** - Everyone benefits from improvements
- **Free forever** - No paywalls, no subscriptions

### 🌍 Community Involvement

This tool will always remain:
- **Free and open source**
- **Community-driven**
- **Actively maintained**
- **Welcoming to contributors**

---

## 💬 Personal Note

If this tool has helped you, consider:
- ⭐ **Starring the repository** on GitHub
- 🐛 **Reporting bugs** you encounter
- 💡 **Suggesting features** you'd like to see
- 🤝 **Contributing code** or modifier data
- 📢 **Sharing with friends** who play PoE2

Every contribution, no matter how small, helps make this tool better for everyone.

---

## 📞 Contact & Social

- **GitHub**: [@Dboire9](https://github.com/Dboire9)
- **Discord**: [Join the Discord](https://discord.gg/RvxCWyFF3D)
- **Project Repository**: [POE2_HTC](https://github.com/Dboire9/POE2_HTC)
- **Issues & Bug Reports**: [GitHub Issues](https://github.com/Dboire9/POE2_HTC/issues)
- **Discussions & Questions**: [GitHub Discussions](https://github.com/Dboire9/POE2_HTC/discussions)

---

## 🙏 Acknowledgments

This project wouldn't exist without:

**Technical Mentors:**
- [@traylorre](https://github.com/traylorre) - Algorithm optimization guidance, professional advice and point of view 
- [@fZpHr](https://github.com/fZpHr) - Frontend code review and architectural advice

**Community:**
- The Path of Exile 2 community for feedback and testing
- POE2DB for modifier data and crafting information
- PoE Wiki contributors for comprehensive game mechanics documentation
- thefarmer and the mods on its Discord

---

## 💖 Support the Project

This project is free and open source, developed in my spare time. If you'd like to support continued development:

- **Contribute code** - Fix bugs, add features, improve documentation
- **Report issues** - Help identify and fix problems
- **Spread the word** - Share with your guild and friends
- **Star the repo** - Show your support on GitHub

---

## 💭 Final Thoughts

Path of Exile 2's crafting system is a beautiful puzzle. I know that some people will not be happy about this tool being released as it may make profit crafting more difficult. But my intention has always been to help players. By providing transparency and tools, I hope to elevate the crafting experience for everyone.

Whether you're a casual player crafting your first rare item or a hardcore crafter chasing perfect T1 rolls, I hope this tool helps you achieve your goals more efficiently and enjoyably.

Log In, Exile! 

— Dorian Boiré  
*Creator of POE2 How To Craft*

---

## 📊 Project Stats

- **First Commit**: December 2024 (Began September 2024)
- **Lines of Code**: ~15,000+ (Java + TypeScript)
- **Items Supported**: 50+ base types (with the hybrids)
- **Modifiers Tracked**: 500+ unique modifiers
- **Algorithm Complexity**: O(n * k^d) where n=beam width, k=branching factor, d=depth
- **Average Simulation Time**: 3-8 seconds
- **Contributors**: Open to all!