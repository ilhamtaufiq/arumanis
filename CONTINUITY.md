# CONTINUITY.md

## Goal
Optimize Ami AI Dashboard Analytics and simplify Pekerjaan Progress reporting by replacing complex grid libraries with intuitive, native UI components.

## Constraints/Assumptions
- Framework: Next.js (frontend) + Laravel (backend) + Python (LangChain AI logic).
- Read-only data safety policy.
- ChromaDB storage at `storage/ai`.

## Key Decisions
- Integrated `recharts` for dynamic JSON-to-Chart rendering in `LoungeChat` and `ChatPage`.
- Implemented a PHP-Python bridge for LangChain reasoning.
- Enhanced system prompt for strict table formatting and deep-linking.
- Added model name display and error status (red color) indicators.

## State
- **Done**:
    - Automated Chart rendering in Dashboard & Chat Page.
    - Premium animations (fade-in, slide-in, bouncing dots).
    - Model info display in UI.
    - Error state handling (Red indicator).
    - Dynamic ticket links in AI responses.
    - Refactored `ProgressTabContent.tsx` to remove Handsontable and replace it with a native Shadcn-based input system.
    - Extracted PDF generation logic to `pdf-generator.ts` utility.
- **Now**:
    - Monitoring for potential UI/UX feedback on the new input system.
- **Next**:
    - Clean up unused Handsontable dependencies if no longer used elsewhere.
    - Refine anomaly detection accuracy.
    - Expand knowledge base indexing.

## Open Questions
- None currently.

## Working Set
- `c:/laragon/www/bun/src/features/dashboard/components/LoungeChat.tsx`
- `c:/laragon/www/bun/src/features/chat/components/chat-page.tsx`
- `c:/laragon/www/apiamis/scripts/chat_langchain.py`
- `c:/laragon/www/apiamis/app/Http/Controllers/ChatController.php`
