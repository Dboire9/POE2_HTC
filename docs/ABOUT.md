# About POE2 How To Craft

## About the Project

**POE2 How To Craft** is a crafting optimization tool designed to help Path of Exile 2 players find the most efficient paths to craft their desired items. Born from the frustration of wasting valuable currency on inefficient crafting strategies, this tool uses advanced algorithms to calculate optimal crafting sequences and their success probabilities.

### The Problem

Crafting in Path of Exile 2 is notoriously complex:
- Hundreds of possible modifiers per item type
- Multiple crafting currencies with different behaviors
- Exponential combinations (6 modifiers = millions of possible paths)
- No in-game guidance on optimal strategies
- Extremely expensive trial-and-error learning

Players often waste thousands of Exalted Orbs and hours of gameplay trying to craft their perfect items without knowing if their approach is even viable.

### The Solution

This application:
- **Calculates exact probabilities** for any crafting goal
- **Finds optimal paths** using a modified Beam Search algorithm
- **Provides step-by-step instructions** for in-game execution
- **Saves time and currency** by eliminating guesswork
- **Educates players** about crafting mechanics and strategies

### Key Features

- **Comprehensive item database** covering all craftable items
- **Smart modifier selection** with family conflict detection
- **Real-time simulation** with results in 3-8 seconds
- **Multiple path suggestions** ranked by probability
- **Desktop application** with auto-update support
- **Open source** and community-driven

---

## About the Developer

### Who Am I?

Hi! I'm **Dorian Boire** ([@Dboire9](https://github.com/Dboire9)), a passionate software developer and avid Path of Exile player. I've been playing the PoE series since the early days and have always been fascinated by the depth and complexity of its crafting system.

### Why I Built This

**The Inspiration:**

During my Path of Exile 2 early access experience, I found myself constantly struggling with crafting decisions:
- *"Should I use an Exalted Orb or try an Essence?"*
- *"What's the actual probability of hitting these three modifiers?"*
- *"Is this craft even possible, or am I wasting my time?"*

After burning through stashes of currency with no clear strategy, I realized there had to be a better way. As a developer with a background in algorithms and optimization, I thought: **"What if I could calculate the exact probabilities and find the optimal path automatically?"**

**The Challenge:**

Building this tool was a fascinating technical challenge:
- Modeling the entire crafting system in code
- Implementing efficient search algorithms (Beam Search)
- Calculating accurate probabilities for complex sequences
- Designing an intuitive UI for a complex problem
- Optimizing performance for real-time results

**The Goal:**

My goal was to create a tool that:
1. **Helps players make informed decisions** - Know the odds before you start
2. **Reduces frustration** - Stop wasting currency on impossible crafts
3. **Teaches crafting mechanics** - Understand why certain paths work better
4. **Saves time** - Focus on playing, not on trial-and-error
5. **Gives back to the community** - Open source for everyone to use and improve

### My Background

**Technical Skills:**
- Software Engineering (Java, TypeScript, React)
- Algorithm Design and Optimization
- Full-Stack Development
- Desktop Application Development (Electron)

**Gaming Experience:**
- 2000+ hours in Path of Exile series
- Deep knowledge of crafting mechanics
- Active in the PoE community
- Theory-crafting enthusiast

### Development Journey

**Timeline:**
- **December 2024**: Early PoE2 access, frustration with crafting
- **December 2024 - January 2025**: Initial algorithm design and prototyping
- **January 2025**: Backend implementation in Java
- **January 2025**: Frontend development with React
- **January 2025**: First public release (v1.0.0)
- **Ongoing**: Community feedback and continuous improvements

**Challenges Overcome:**
1. **Algorithmic complexity** - Crafting space has ~10^20 possible paths
   - *Solution*: Beam Search with intelligent pruning
   
2. **Performance** - Initial simulations took 5+ minutes
   - *Solution*: Multithreading and heuristic optimization
   
3. **Data accuracy** - Modifier weights change with patches
   - *Solution*: JSON-based data files, easy community updates
   
4. **User experience** - Crafting is complex, UI must be simple
   - *Solution*: Iterative design with user feedback

### What I Learned

This project taught me:
- **Algorithm optimization** - Balancing accuracy vs. performance
- **Domain modeling** - Translating game mechanics into code
- **User experience** - Making complex systems accessible
- **Open source collaboration** - Working with community contributors
- **Full-stack development** - Connecting Java backend with React frontend

---

## Project Philosophy

### Open Source First

I believe powerful tools should be accessible to everyone. By making this project open source:
- **Transparency** - Everyone can see how it works
- **Community contributions** - Collective improvement
- **Learning resource** - Others can learn from the code
- **Trust** - No hidden mechanics or paid features

### Community-Driven

The PoE community is incredible, and this tool is built for them:
- **User feedback shapes development** - Features based on real needs
- **Community data updates** - Players help keep modifier data current
- **Shared knowledge** - Everyone benefits from improvements
- **Free forever** - No paywalls, no subscriptions

### Quality Over Speed

I'm committed to:
- **Accurate calculations** - Probabilities match real game mechanics
- **Reliable performance** - Consistent results every time
- **Clean code** - Maintainable and well-documented
- **Thorough testing** - Automated tests for critical functionality

---

## Vision for the Future

### Short-Term Goals

- **Add more item types** - Cover all craftable items in PoE2
- **Improve UI/UX** - More intuitive modifier selection
- **Export functionality** - Share crafting paths as images
- **Cost estimation** - Calculate expected currency costs

### Long-Term Vision

- **Live game integration** - (If permitted by GGG)
- **Trade API integration** - Factor in market prices
- **Crafting simulator** - Practice crafting sequences without cost
- **Community sharing** - Share and discover popular crafts
- **Mobile companion app** - Check probabilities on the go

### Community Involvement

This tool will always remain:
- **Free and open source**
- **Community-driven**
- **Actively maintained**
- **Welcoming to contributors**

---

## Personal Note

Building this tool has been one of the most rewarding projects of my career. Seeing players use it to achieve their crafting goals, save currency, and learn about the crafting system makes all the late nights debugging algorithms worth it.

If this tool has helped you, consider:
- ⭐ **Starring the repository** on GitHub
- 🐛 **Reporting bugs** you encounter
- 💡 **Suggesting features** you'd like to see
- 🤝 **Contributing code** or modifier data
- 📢 **Sharing with friends** who play PoE2

Every contribution, no matter how small, helps make this tool better for everyone.

---

## Contact & Social

- **GitHub**: [@Dboire9](https://github.com/Dboire9)
- **Project Repository**: [POE2_HTC](https://github.com/Dboire9/POE2_HTC)
- **Issues & Bug Reports**: [GitHub Issues](https://github.com/Dboire9/POE2_HTC/issues)
- **Discussions & Questions**: [GitHub Discussions](https://github.com/Dboire9/POE2_HTC/discussions)

---

## Acknowledgments

This project wouldn't exist without:

**Technical Mentors:**
- [@traylorre](https://github.com/traylorre) - Algorithm optimization guidance
- [@fZpHr](https://github.com/fZpHr) - Code review and architectural advice

**Community:**
- The Path of Exile 2 community for feedback and testing
- POE2DB for modifier data and crafting information
- PoE Wiki contributors for comprehensive game mechanics documentation

**Inspiration:**
- Grinding Gear Games for creating an incredibly deep crafting system
- Other PoE tool creators who showed what's possible
- Every player who's ever said "there has to be a better way to craft"

---

## Support the Project

This project is free and open source, developed in my spare time. If you'd like to support continued development:

- **Contribute code** - Fix bugs, add features, improve documentation
- **Report issues** - Help identify and fix problems
- **Spread the word** - Share with your guild and friends
- **Star the repo** - Show your support on GitHub

No monetary donations accepted - I do this for the love of the game and the community!

---

## Final Thoughts

Path of Exile 2's crafting system is a beautiful puzzle. It's complex, challenging, and deeply rewarding when you finally craft that perfect item. This tool doesn't take away from that experience - it enhances it by giving you the knowledge to make informed decisions.

Whether you're a casual player crafting your first rare item or a hardcore crafter chasing perfect T1 rolls, I hope this tool helps you achieve your goals more efficiently and enjoyably.

Happy crafting, Exile! 🎮⚔️

— Dorian Boire  
*Creator of POE2 How To Craft*

---

## Project Stats

- **First Commit**: December 2024
- **Lines of Code**: ~15,000+ (Java + TypeScript)
- **Items Supported**: 50+ base types
- **Modifiers Tracked**: 500+ unique modifiers
- **Algorithm Complexity**: O(n * k^d) where n=beam width, k=branching factor, d=depth
- **Average Simulation Time**: 3-8 seconds
- **Contributors**: Open to all!

---

*This document was last updated: January 2025*
