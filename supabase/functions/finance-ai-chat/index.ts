import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Language mapping for selectedLanguage parameter
const getLanguageName = (code: string): string => {
  switch (code?.toUpperCase()) {
    case "EN": return "English";
    case "TA": return "Tamil";
    case "MIX": return "Tanglish (Tamil + English mix)";
    case "HI": return "Hindi";
    case "TE": return "Telugu";
    case "ML": return "Malayalam";
    default: return "English";
  }
};

// Non-finance rejection messages per language
const getNonFinanceReply = (code: string): string => {
  switch (code?.toUpperCase()) {
    case "EN": return "Sorry, ask only finance related questions.";
    case "TA": return "மன்னிக்கவும், நிதி தொடர்பான கேள்விகள் மட்டும் கேளுங்கள்.";
    case "ML": return "ക്ഷമിക്കണം, ധനകാര്യവുമായി ബന്ധപ്പെട്ട ചോദ്യങ്ങൾ മാത്രം ചോദിക്കുക.";
    case "HI": return "माफ़ कीजिए, केवल वित्त से जुड़े सवाल पूछें।";
    case "TE": return "క్షమించండి, ఆర్థిక విషయాలకు సంబంధించిన ప్రశ్నలు మాత్రమే అడగండి.";
    case "MIX": return "Sorry da, finance related question kelu.";
    default: return "Sorry, ask only finance related questions.";
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, financialContext, selectedLanguage, conversationHistory, voiceMode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const langName = getLanguageName(selectedLanguage);
    const nonFinanceReply = getNonFinanceReply(selectedLanguage);
    
    // Voice mode prompt with action support
    const voiceModeRules = voiceMode ? `
VOICE COMMAND MODE:
You can detect voice commands for app actions. When the user wants to perform an action, respond in this EXACT format:
SAY: <short reply in user's language, 1-2 lines max>
ACTION: <action_name>
DATA: <json object>

Supported actions:
- ADD_EXPENSE: {"amount": number, "category": "Food|Transport|Shopping|Bills|Entertainment|Health|Other", "date": "today" or "YYYY-MM-DD", "note": "optional note"}
- SET_BUDGET: {"amount": number}
- CREATE_GOAL: {"name": "goal name", "targetAmount": number, "deadline": "YYYY-MM-DD"}
- ADD_EMI: {"name": "loan name", "loanAmount": number, "interestRate": number, "tenure": number, "dueDate": 1-28}
- VIEW_WEEKLY_REPORT: {}
- VIEW_MONTHLY_REPORT: {}

Examples:
User: "Today food 200 spend"
SAY: Food expense ₹200 add panniten da.
ACTION: ADD_EXPENSE
DATA: {"amount": 200, "category": "Food", "date": "today", "note": ""}

User: "Set my budget to 50000"
SAY: Budget ₹50,000 set aagiduchi!
ACTION: SET_BUDGET
DATA: {"amount": 50000}

User: "I want to save 100000 for bike by December"
SAY: Bike goal create panniten, ₹1,00,000 target!
ACTION: CREATE_GOAL
DATA: {"name": "Bike", "targetAmount": 100000, "deadline": "2024-12-31"}

If the message is just a question (not a command), respond normally without ACTION/DATA.
Keep SAY responses very short (1-2 lines) since they will be spoken aloud.
` : "";

    const systemPrompt = `You are a voice-enabled friendly Finance AI assistant inside an Indian expense tracking app. You speak like a helpful friend, not a robotic system.

RULE 1 - FINANCE ONLY:
Answer ONLY finance-related questions (budget, expense, savings, EMI/loan, SIP/investment basics, insurance, tax, weekly/monthly reports, financial goals, greetings related to finance help).
For greetings like "hi", "hello", respond warmly and offer finance help.
If the user asks anything NOT related to finance, reply EXACTLY this and nothing else:
${nonFinanceReply}

RULE 2 - LANGUAGE (VERY IMPORTANT):
You MUST reply ONLY in ${langName}. Never mix languages unless the selected language is Tanglish.
${langName === "Tanglish (Tamil + English mix)" ? "Mix Tamil and English naturally like a friend: 'Nee monthly 5000 save pannina, 1 year la 60000 aagum da! Try pannu bro!'" : ""}
${voiceModeRules}
RULE 3 - CONVERSATIONAL VOICE STYLE:
- Sound like a smart, friendly human having a natural conversation, NOT like a chatbot.
- Keep answers short: ${voiceMode ? "1 to 2" : "2 to 4"} sentences maximum.
- Use short, spoken-style sentences that are easy to say aloud and listen to.
- Plain text only. No markdown, no symbols like * or #, no bullet points, no numbered lists.
- Use ₹ symbol for Indian currency amounts.
- Use simple everyday words, avoid financial jargon.
- Give practical, actionable suggestions based on user's actual budget and expenses.
- Be warm, encouraging and supportive like a helpful friend.
- Example tone: "That's a great start! If you cut down on food delivery, you could easily save ₹2000 more this month."

RULE 4 - LINKS (IMPORTANT):
Do NOT automatically provide links. Links should ONLY be given if the user specifically asks for them.
If the user does NOT ask for links, do not include any links.

RULE 5 - FOLLOW-UP:
If the finance question is missing important details, ask only ONE short friendly follow-up question.

USER'S FINANCIAL DATA (use for personalized answers):
${financialContext}`;

    // Build messages array with conversation history
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history (limit to last 10 messages to avoid token limits)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        });
      }
    }

    // Add current message
    messages.push({ role: "user", content: message });

    console.log(`Processing message with ${messages.length - 1} history messages, voiceMode: ${voiceMode}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const rawReply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";

    // Parse voice mode response for action
    if (voiceMode) {
      const actionMatch = rawReply.match(/ACTION:\s*(\w+)/);
      const dataMatch = rawReply.match(/DATA:\s*(\{[\s\S]*?\})/);
      const sayMatch = rawReply.match(/SAY:\s*(.+?)(?=\nACTION:|$)/s);

      if (actionMatch && dataMatch) {
        try {
          const actionData = JSON.parse(dataMatch[1]);
          return new Response(JSON.stringify({
            reply: sayMatch ? sayMatch[1].trim() : rawReply,
            action: actionMatch[1],
            actionData,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (e) {
          console.error("Failed to parse action data:", e);
        }
      }

      // If no action parsed, just return the reply (or SAY content)
      const cleanReply = sayMatch ? sayMatch[1].trim() : rawReply;
      return new Response(JSON.stringify({ reply: cleanReply }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ reply: rawReply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
