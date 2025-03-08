// This edge function checks budget thresholds and creates alerts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id");

    if (usersError) throw usersError;

    const results = [];

    // Process each user's budgets
    for (const user of users) {
      // Get budget summary for this user
      const { data: budgets, error: budgetsError } = await supabase
        .from("family_budgets")
        .select("*")
        .eq("profile_id", user.id);

      if (budgetsError) throw budgetsError;

      // Group budgets by category
      const categoryTotals = {};
      for (const budget of budgets) {
        if (!categoryTotals[budget.category]) {
          categoryTotals[budget.category] = { amount: 0, spent: 0 };
        }
        categoryTotals[budget.category].amount += budget.amount;
        categoryTotals[budget.category].spent += budget.spent;
      }

      // Check each category for threshold crossing
      for (const [category, { amount, spent }] of Object.entries(
        categoryTotals,
      )) {
        if (amount === 0) continue; // Skip if no budget set

        const percentage = Math.round((spent / amount) * 100);

        // Check if we already sent an alert for this category and threshold
        const { data: existingAlerts } = await supabase
          .from("notifications")
          .select("*")
          .eq("profile_id", user.id)
          .eq("category", "budget")
          .ilike("message", `%${category}%`)
          .ilike("message", `%${percentage >= 90 ? "90" : "75"}%`)
          .gte(
            "created_at",
            new Date(
              new Date().setDate(new Date().getDate() - 7),
            ).toISOString(),
          );

        // Only create alert if we haven't sent one in the last week
        if (!existingAlerts || existingAlerts.length === 0) {
          // Create alerts at 75% and 90% thresholds
          if (percentage >= 90) {
            await createBudgetAlert(
              supabase,
              user.id,
              category,
              percentage,
              "alert",
            );
            results.push({
              userId: user.id,
              category,
              percentage,
              level: "90%+",
            });
          } else if (percentage >= 75) {
            await createBudgetAlert(
              supabase,
              user.id,
              category,
              percentage,
              "info",
            );
            results.push({
              userId: user.id,
              category,
              percentage,
              level: "75%+",
            });
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, alerts: results }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing budget alerts:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function createBudgetAlert(supabase, userId, category, percentage, type) {
  const { error } = await supabase.from("notifications").insert({
    profile_id: userId,
    title: "Budget Alert",
    message: `You've used ${percentage}% of your ${category} budget.`,
    type,
    category: "budget",
    read: false,
  });

  if (error) throw error;
  return true;
}
