# ServiceNow React Application Development Guidelines
## Overview

This guide provides custom instructions for developing modern React applications on the ServiceNow platform using the ServiceNow React Boilerplate (based on Create React App). We will focus on building standalone React pages that can be linked from ServiceNow portals, using Tailwind CSS for styling and Lucide React for icons. The approach is not tied to any particular application scope, and it emphasizes best practices for both development and deployment within ServiceNow. By following these guidelines, you can create dynamic, modern UIs in ServiceNow while adhering to proven development workflows and ServiceNow’s deployment constraints

Development Tips: Develop your React app as you normally would. You can use modern React features (hooks, context, etc.), component libraries, and routing. The boilerplate supports standard CRA features like fast refresh. Keep in mind any ServiceNow-specific constraints—for example, plan for a single-page app output (one HTML, JS, and CSS file) for easier deployment on the platform
pishchulin.medium.com
.

Modern UI Styling with Tailwind CSS and Lucide Icons

To achieve a sleek, modern design consistent with today's web standards, this project uses Tailwind CSS and Lucide React icons, drawing inspiration from contemporary component libraries.

Integrating Tailwind CSS: Install Tailwind and its PostCSS plugins in the project (if not already set up). For example, run:

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p


This will generate a tailwind.config.js and a postcss.config.js. Configure Tailwind by specifying the paths to your React files in tailwind.config.js (e.g. all .js/.jsx in src directory) and include the Tailwind directives in your main CSS file. In src/index.css (or App.css), import Tailwind's base, components, and utilities styles:

@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";


These steps integrate Tailwind’s utility classes into your build pipeline
geeksforgeeks.org
geeksforgeeks.org
. You can now use Tailwind classes in your JSX for rapid UI styling (e.g. className="bg-blue-500 text-white p-4 rounded-lg" for a styled button).

Using Lucide React for Icons: Lucide is a modern icon library (a fork of Feather icons) that provides React components for each icon. Install it with npm install lucide-react. You can then import icons as React components. For example:

import { Camera, Edit, Trash } from 'lucide-react';
// ...
<Camera color="red" size={24} /> 


Each icon is an inline SVG React component, and you can pass props like color, size, or strokeWidth to customize it
lucide.dev
lucide.dev
. Only the icons you import will be included in your bundle (tree-shaking ensures unused icons are excluded), which keeps the bundle size small.

Inspiration from 21st.dev Components: For design inspiration and even pre-built components, you can explore 21st.dev, a community-driven registry of modern React components. It offers a library of minimal, modern components built with Tailwind CSS and Radix UI, inspired by the popular shadcn/UI design system
github.com
. You might find ready-made UI patterns (navigation bars, tables, modals, etc.) that you can incorporate or use as a reference for styling. These components adhere to current best-practice patterns (responsive design, dark mode support, accessible markup) which you should strive to follow. While building your app, consider leveraging such resources to accelerate development and maintain a consistent modern look and feel. For example, you could copy a beautifully styled card or form component from 21st.dev and adapt it to your needs, rather than designing from scratch, as long as it fits your Tailwind setup.

Styling Best Practices: Use Tailwind utility classes to rapidly prototype and ensure consistency. Keep your styling configuration in tailwind.config.js if you need to extend the theme or add custom colors, etc. Organize complex styling by extracting components or using Tailwind’s @apply for repetitive patterns, but prefer small, reusable React components for UI elements. When using icons or images, optimize them (Lucide icons are SVGs which are already efficient). Ensure your UI remains responsive (Tailwind’s responsive variants can help). Also, maintain accessibility: use proper HTML semantics and ARIA labels for icons or interactive elements, and test components for keyboard navigation and screen-reader friendliness.

Accessing ServiceNow Data from React

One of the main purposes of a ServiceNow React app is likely to display or manipulate ServiceNow data (records, tasks, etc.) via API calls. Here’s how to handle data access and ensure it works both during development and after deployment:

Development Mode Data Access: While running npm start locally, the CRA dev server proxy (configured in package.json) will forward API calls to your ServiceNow instance. You can use relative paths for ServiceNow REST endpoints in your code (e.g. fetch('/api/now/table/incident?sysparm_limit=10')). The proxy will attach the Basic Auth from your .env and contact the instance
github.com
. This means you can test CRUD operations against your dev instance in real-time. Use the official ServiceNow REST APIs (Table API, Scripted REST API, etc.) to retrieve or update data. For example, to fetch incidents you might call:

const res = await fetch('/api/now/table/incident?sysparm_limit=10'); 


In development, this request is proxied and authenticated, returning incident data (JSON).

Production Mode Data Access: When you build and deploy the React app to ServiceNow, it will be served from your instance and executed in the user’s browser within the ServiceNow domain. The React app can call ServiceNow APIs directly (no proxy needed) because it shares the domain and session. In this mode, you should remove any hard-coded credentials or proxy URLs – the app will rely on the logged-in user's session and permissions. All ServiceNow security mechanisms still apply, but you typically need to ensure the user’s session token is included in API calls for them to succeed
pishchulin.medium.com
. On ServiceNow, this session token (g_ck) is usually required for state-changing requests (POST/PUT/DELETE) as a protection against CSRF.

How to include the session token: There are a couple of ways:

If your React app is loaded as a UI Page (direct link), you may be able to fetch the session token via an API call (for example, calling the Session API or using a GlideAjax script that returns GlideSession.get().getSessionToken()).

If your React is embedded in a Service Portal widget (see the Portal Integration section below), the recommended approach (per ServiceNow best practices) is to retrieve the token server-side and pass it to the client. In a portal widget, a Server Script can call any API (like /api/now/ui/page or others) to obtain g_ck, then the Client Script can grab that token and set it in window before loading the React bundle
pishchulin.medium.com
pishchulin.medium.com
.

Simpler: If your UI page is opened in the context of an existing logged-in session, and you are performing read-only GET requests, you might not need to do anything special – the session cookie may suffice for GET requests. For modifying data (or if encountering 401 errors on POST), ensure you include the X-UserToken header with the g_ck value in your fetch/axios calls.

In practice, one convenient method on a UI Page is to include a small script snippet that sets window.g_ck to the user’s session token (retrieved via GlideAjax or by embedding a <script> that contains the token). This way, your React code can read window.g_ck and attach it to REST calls. The boilerplate’s development mode doesn’t use g_ck (it uses basic auth), so you’ll need to add production logic for token usage if needed. Security note: By deploying the React bundle on ServiceNow, the app automatically inherits ServiceNow's security model – users must be authenticated to access the UI Page, and any API calls made will enforce the user’s roles and ACLs.
You don’t have to implement a separate auth system, but do make sure to handle errors from API calls (e.g., insufficient rights or record not found) gracefully in the UI.

Best Practices and Additional Tips

Source Control & Collaboration: Keep your React source code in a source control system (e.g., GitHub) and use typical Git workflows for collaboration. Treat the ServiceNow instance as a deployment target, not the source of truth for your code. The compiled code in ServiceNow can be reconstructed by building the source; don't hand-edit the JS in ServiceNow.

Modularity: Even though the final output is a single bundle, structure your React app code modularly. Use components and possibly code-splitting (dynamic import()) if the app grows large – just remember that any additional chunk files will also need to be uploaded. The boilerplate’s default config is to avoid multiple tiny chunks, but you can still lazy-load huge sections of the app if needed (they would appear as additional .js files to deploy). Balance user experience (initial load time) with deployment complexity.

Performance Considerations: ServiceNow will serve your files over its web infrastructure. A single JS bundle of moderate size (e.g., a few hundred KB gzipped) is typically fine. If you include large libraries or lots of icons/images, watch the size. Use Chrome DevTools Performance panel to identify any render jank or slow network calls. Because the app runs entirely client-side, its performance is mainly client-dependent, but inefficient REST calls (too many, or fetching more data than needed) can indirectly strain the instance. Optimize API usage with query parameters (use sysparm_fields, sysparm_limit, etc. to limit data) and caching where possible.

Security Best Practices: Your React app operates under ServiceNow's security umbrella. Leverage that – for example, use server-side API endpoints that respect user roles instead of trying to enforce security entirely in the client. Never expose secrets in the client bundle. All communication should be via HTTPS (which it will, since it's the SN instance domain). Also, be mindful of preventing XSS in any dynamic content you render (use React’s default escaping and only dangerously set HTML when absolutely necessary).

Consistency with ServiceNow UX: If this React app is part of a larger ServiceNow portal or UI experience, consider aligning its styling to some extent with ServiceNow’s look (or the company’s branding). Tailwind makes it easy to apply custom color themes or spacing that match the rest of the portal. You might also integrate a CSS reset or base that harmonizes with ServiceNow’s UI frames. When linking from a portal, ensure users understand they are navigating to a new page – you can style the link as a button or clearly label it.

Future Evolution – Next Experience: As ServiceNow’s Next Experience (now using React internally for workspace UIs) matures, there may be more official support for React front-ends. Keep an eye on updates from ServiceNow on React support. For now, the approach described (UI Pages and Style Sheets) is a proven method used by many in the community to deliver React apps on ServiceNow
pishchulin.medium.com
pishchulin.medium.com
.

Troubleshooting: Common issues include blank pages (check that all resources are loaded and no JS errors), API calls failing (likely permission or missing token issues), or styling problems (ensure your Tailwind CSS is included and your classes are not purged unexpectedly – the content paths in tailwind.config.js must cover your component files). Use browser dev tools extensively: console logs, network inspector, and so on, to debug. Since the app is client-side, you can also use React Developer Tools extension to inspect component state in production if needed.

Multiple React Pages: If you plan to have multiple distinct React apps (for different portal links), you can either create separate projects (each with its own build and UI page), or one project with multiple entry points. The boilerplate is single-entry by default (one index.html). Separate projects might be simpler to manage if the pages are unrelated. If the pages share a lot of code or state, you could combine them into one app with internal routing – but remember, a UI Page corresponds to one HTML entry point. You could use client-side routing (React Router) within one app for sub-pages or views; just use HashRouter or similar so that routing stays in the client (because ServiceNow will not handle dynamic sub-paths in the URL)
stackoverflow.com
. For example, one UI Page could host a React app that uses <HashRouter> to handle multiple views (URLs after a # won’t confuse the server). Choose an approach that fits your use case and maintainability.

Deployment Automation: As a best practice in a team setting, consider automating the build and deployment. You might use a CI pipeline that runs tests, builds the app, then uses the ServiceNow API to deploy the new files (some developers use the Attachment API or MID server scripts to push files). While manual deployment is fine for prototypes or small-scale use, automation reduces error and ensures consistency especially if you deploy frequently.

DOs and DON'Ts for ServiceNow React App Development
✅ DOs
- Use Tailwind CSS for all styling. Prefer utility classes over custom CSS.
- Use Lucide React for icons. Import only needed icons to keep bundle size small.
- Take design inspiration or components from 21st.dev to achieve modern aesthetics.
- Use functional components and modern React (hooks, context, etc.).
- Structure code modularly: separate reusable components and route-level pages.
- Use HashRouter for routing to support SPA behavior inside ServiceNow.
- Fetch ServiceNow data via REST APIs using relative paths (e.g. /api/now/...).
- Include the session token (g_ck) via GlideAjax or Scripted REST API when needed for POST/PUT/DELETE.
- Serve React app from a UI Page or Scripted REST API using inline JS/CSS or bundled HTML.
- Minimize final JS/CSS bundle size to stay within ServiceNow size limits.
- Use Axios for HTTP calls and configure X-UserToken header where needed.
- Gracefully handle errors and permission issues from API responses.
- Ensure responsiveness and accessibility across all UI components.
- Keep styling consistent and modern, prefer clean layouts with Tailwind spacing/typography.

❌ DON'Ts
❌ Don’t use raw CSS files or external stylesheets (keep everything inside Tailwind classes or injected CSS).
❌ Don’t use BrowserRouter – it will break routing on ServiceNow.
❌ Don’t hardcode ServiceNow instance URLs or credentials.
❌ Don’t store sensitive data in localStorage, sessionStorage, or inside JS bundles.
❌ Don’t assume REST calls will work without user session/token – use g_ck where required.
❌ Don’t depend on multiple files for deployment – aim for single HTML/JS bundle when possible.
❌ Don’t forget to test in ServiceNow context (UI Page or Portal iframe) before production.
❌ Don’t over-fetch data or skip pagination – be ServiceNow-performant.
❌ Don’t use legacy React patterns (e.g., class components, outdated lifecycle methods).
❌ Don’t inject HTML into ServiceNow without proper escaping and XSS precautions.