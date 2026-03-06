import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

console.log("GOOGLE CALLBACK =", process.env.GOOGLE_CALLBACK_URL);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 🔑 1. Get email safely
        const rawEmail = profile.emails?.[0]?.value;

        if (!rawEmail) {
          console.log("❌ No email from Google profile");
          return done(null, false);
        }

        // 🔑 2. NORMALIZE email (THIS IS THE FIX)
        const email = rawEmail.toLowerCase().trim();

        console.log("🔵 Google email:", email);

        // 🔍 3. Find existing user
        const user = await User.findOne({ collegeEmail: email });

        console.log("🟡 User found:", !!user);

        if (!user) {
          console.log("❌ No user found for email");
          return done(null, false);
        }

        if (!user.isApproved) {
          console.log("❌ User found but not approved");
          return done(null, false);
        }

        console.log("🟢 OAuth login success:", email);

        // ✅ Success
        return done(null, {
          id: user._id,
          role: user.role,
        });
      } catch (err) {
        console.error("OAuth error:", err);
        return done(err, null);
      }
    }
  )
);

// ❌ No sessions (JWT-based auth)
passport.serializeUser(() => {});
passport.deserializeUser(() => {});
