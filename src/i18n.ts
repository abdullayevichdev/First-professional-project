import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        uzb_politics: 'Uzbekistan Politics',
        global_politics: 'Global Politics',
        speech_analysis: 'Speech Analysis',
        opinion: 'Opinion & Analysis',
        about: 'About',
        contact: 'Contact',
        glossary: 'Glossary'
      },
      hero: {
        slogan: "With the expressed intention of deriving semantic significance from every utterance and intellectual insight from every derived meaning, we endeavor to translate the formative influences documented within the annals of history into the operative discourses of contemporary existence"
      },
      auth: {
        login: 'Login',
        logout: 'Logout',
        register: 'Register',
        gmail_only: "Google Gmail only",
        welcome_back: "Welcome Back",
        sign_in_desc: "Sign in to access exclusive content and analysis",
        register_title: "Welcome",
        register_desc: "Please enter your details to continue",
        continue_google: "Continue with Google",
        continue_apple: "Continue with Apple",
        terms_agree: "By continuing, you agree to our Terms of Service and Privacy Policy."
      },
      common: {
        read_more: 'Read More',
        key_points: 'Key Points',
        author: 'Author',
        date: 'Date',
        preview_mode: "Login to read full article",
        mission: "Our Mission",
        why_matters: "Why it matters?",
        newsletter: "Subscribe to Newsletter",
        latest_updates: "Latest Updates",
        view_archive: "View Archive",
        trending: "Trending Now",
        multimedia: "Multimedia Insights",
        strategic_insights: "Strategic Insights",
        join_discussion: "Join the Discussion",
        become_member: "Become a Member",
        featured_analysis: "Featured Analysis",
        weekly_brief: "The Weekly Brief",
        weekly_brief_desc: "Get our most rigorous political analysis delivered to your inbox every Sunday morning.",
        email_placeholder: "Email Address",
        subscribe: "Subscribe",
        subscribed: "Subscribed!",
        decoding_speeches: "Decoding Political Speeches",
        decoding_desc: "Watch our expert curators break down the hidden meanings and historical context behind recent major addresses.",
        watch_analysis: "Watch Analysis",
        international_relations: "International Relations",
        historical_context: "Historical Context",
        future_integration: "The Future of Central Asian Integration",
        future_integration_desc: "An in-depth look at the economic and political factors driving the new era of cooperation between regional powers.",
        digital_sovereignty: "Digital Sovereignty in the 21st Century",
        digital_sovereignty_desc: "How nations are navigating the complexities of data privacy, AI ethics, and technological independence.",
        community_desc: "Our platform is more than just news. It's a community of scholars, analysts, and engaged citizens.",
        editorial: "Tahqiq Editorial",
        explore_archives: "Explore Archives",
        trending_1: "The shifting dynamics of Central Asian diplomacy in 2026.",
        current_edition: "Current Edition",
        member: "Member",
        admin_access: "Admin Access",
        analytical_insight: "Analytical Insight",
        search_placeholder: "Search articles..."
      },
      footer: {
        desc: "\"Providing evidence-based analysis of political speeches and global issues to educate and inform. Bridging history and the present.\"",
        platform: "Platform",
        about: "About Us",
        contact: "Contact",
        resources: "Resources",
        legal: "Legal",
        privacy: "Privacy Policy",
        terms: "Terms of Service",
        connect: "Connect",
        rights: "All Rights Reserved",
        designed: "Designed for Excellence",
        global_edition: "Global Edition"
      },
      about: {
        philosophy: "Our Philosophy",
        mission_p1: "Tahqiq is a professional platform dedicated to the evidence-based analysis of political speeches and global issues. Our mission is to educate both Uzbek and international audiences by balancing neytral curation with strong analytical commentary.",
        mission_p2: "We believe that in an era of information overload, the ability to decode the true meaning behind political rhetoric is essential for a healthy democracy and an informed citizenry.",
        why_p1: "Our project matters because it provides a bridge between history and the present. By analyzing the influences of history's pages, we offer prospects for the present time.",
        why_p2: "This platform is particularly valuable for students, researchers, and anyone interested in PPE (Politics, Philosophy, and Economics) applications, providing academic depth and reliable source citations.",
        join: "Join Our Community",
        join_desc: "Stay informed with our latest analytical insights, decoding the complexities of global politics and historical perspectives.",
        contact_editorial: "Contact Editorial"
      },
      contact: {
        get_in_touch: "Get in Touch",
        desc: "\"For inquiries, academic collaborations, or media requests, please reach out to our editorial team.\"",
        editorial_office: "Editorial Office",
        address: "Tashkent, Uzbekistan",
        department: "Political Analysis Department",
        direct_contact: "Direct Contact",
        full_name: "Full Name",
        email: "Email Address",
        message: "Message",
        send_inquiry: "Send Inquiry"
      },
      article: {
        share: "Share",
        save: "Save",
        saved: "Saved",
        copied: "Copied",
        exclusive_analysis: "Exclusive Analysis",
        not_found: "Article not found."
      },
      admin: {
        access: "Admin Access",
        enter_code: "Enter the secure access code to continue",
        unlock: "Unlock Panel",
        console: "Admin Console",
        export: "Export Report",
        exit: "Exit",
        total_users: "Total Users",
        active_today: "Active Today",
        total_actions: "Total Actions",
        user_mgmt: "User Management",
        activity_logs: "Activity Logs",
        departed_users: "Departed Users",
        user: "User",
        email: "Email",
        last_active: "Last Active",
        actions: "Actions",
        message: "Message",
        time: "Time",
        event: "Event",
        details: "Details",
        no_departed: "No departed users found.",
        message_to: "Message to",
        send_notification: "Send a direct notification to this user.",
        type_message: "Type your message here...",
        cancel: "Cancel",
        send: "Send",
        invalid_code: "Invalid Access Code",
        login_failed: "Login failed",
        msg_success: "Message sent successfully",
        msg_failed: "Failed to send message",
        msg_error: "Error sending message",
        add_content: "Add New Content",
        content_mgmt: "Content Management",
        subscribers: "Subscribers",
        messages: "Messages",
        user_submissions: "User Submissions",
        inactive_users: "Inactive Users",
        inactive_desc: "List of users who haven't logged in for the last 30 days.",
        newsletter_subs: "Newsletter Subscribers",
        newsletter_desc: "List of users subscribed to the newsletter.",
        send_to_users: "Send Message to Users",
        send_to_users_desc: "List of all users. You can send messages directly to them.",
        msg_history: "Sent Messages History",
        msg_history_desc: "All messages sent by admins to users.",
        pending: "Pending",
        accepted: "Accepted",
        rejected: "Rejected",
        no_data: "No data found",
        loading: "Loading...",
        publish_and_notify: "Publish Content and Notify",
        existing_content: "Existing Content",
        delete_content: "Delete Content",
        delete_confirm: "Are you sure you want to delete this content? This action cannot be undone.",
        yes_delete: "Yes, Delete",
        no_cancel: "Cancel"
      },
      category: {
        archive_explorer: "Archive Explorer",
        desc: "\"Deep dives, expert analysis, and strategic insights regarding the {{category}} landscape.\""
      },
      glossary: {
        knowledge_base: "Knowledge Base",
        title: "Political Glossary",
        desc: "\"Essential terminology explained for students, researchers, and global citizens.\"",
        watch_explainer: "Watch Explainer",
        terms: {
          parliament: {
            term: "Parliament",
            def: "The supreme representative and legislative body of state power."
          },
          referendum: {
            term: "Referendum",
            def: "A nationwide vote on the most important issues of state significance."
          },
          lobbying: {
            term: "Lobbying",
            def: "The activity of exerting pressure on state bodies to influence political decisions."
          },
          democracy: {
            term: "Democracy",
            def: "A form of government based on the power of the people."
          }
        }
      },
      profile: {
        title: "User Profile",
        personal_info: "Personal Information",
        my_articles: "My Articles",
        saved_articles: "Saved Articles",
        notifications: "Notifications",
        admin_messages: "Messages from Admin",
        read_articles: "Read Articles",
        no_articles: "You haven't submitted any articles yet",
        no_saved: "No saved articles",
        no_notifications: "No new notifications",
        status_pending: "Pending",
        status_accepted: "Accepted",
        status_rejected: "Rejected",
        view: "View",
        read: "Read",
        submit_article: "Submit Article",
        member_since: "Member Since",
        last_active: "Last Active",
        role: "Role",
        user: "User",
        admin: "Admin"
      },
      submit_article: {
        title: "Submit Article",
        subtitle: "If the admin approves your article, we will publish it on the site. Please wait a bit.",
        content_title: "Article Content",
        uzbek: "Uzbek",
        russian: "Russian",
        english: "English",
        label_title: "Title",
        label_excerpt: "Excerpt",
        label_body: "Full Text",
        category_media: "Category & Media",
        category: "Category",
        image_url: "Image URL (optional)",
        video_url: "Video URL (optional)",
        note_title: "Note",
        note_desc: "The article must be submitted in English. This is important for our international audience.",
        submit_btn: "Submit this article to admin",
        success_title: "Successfully submitted!",
        success_desc: "Your article has been sent to the admin. If approved, we will publish it. Please wait.",
        redirecting: "Redirecting to profile page...",
        login_required: "Login required",
        login_required_desc: "Please log in to submit an article.",
        back_home: "Back to Home"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
