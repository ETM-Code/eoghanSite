# TailorAI - PorterShed GenAI Hackathon

**TailorAI** was a project developed for the **PorterShed GenAI Hackathon**. Due to time constraints, only a proof of concept was created, utilizing React for the frontend and a semi-integrated custom GPT for item selection.

## Project Overview

TailorAI is designed to provide personalized fashion recommendations based on user input. The key features include:

- **Input:** The system accepts a mirror selfie of your appearance and a natural language request. For example, you might input, "I want an outfit to present at a silly AI hackathon."
- **Sizing:** TailorAI uses a prior input of your size to ensure the recommendations are a good fit.
- **Item Selection:** The AI searches a database (a JSON file in this proof of concept) to find the most optimal items. 
- **Output:** The system returns items along with their sources, prices, and available sizes/styles. It also suggests what a combined outfit might look like, using a mix of AI image generation and text descriptions.

## Technology Stack

- **Frontend:** React
- **AI Integration:** Custom GPT model for item selection
- **Database:** JSON file for item storage and retrieval

## Future Enhancements

If further developed, TailorAI could include:

- **Enhanced Image Recognition:** More advanced analysis of mirror selfies to better match clothing recommendations.
- **Expanded Database:** Integration with real-time fashion databases for more extensive and up-to-date options.
- **Refined AI Suggestions:** Improved AI-generated imagery and text descriptions for outfit previews.

## Conclusion

TailorAI demonstrated the potential for AI-driven fashion recommendation systems. While this proof of concept was limited by time constraints, the foundational work sets the stage for future development.