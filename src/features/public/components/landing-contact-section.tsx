import { useState, type FormEvent } from 'react';
import { Loader2, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api-client';
import { submitContactInquiry } from '../api/contact';
import type { PublicMessages } from '../i18n/types';

type LandingContactSectionProps = {
    copy: PublicMessages['landing']['contact'];
};

const inputClassName =
    'brutal-input';

export function LandingContactSection({ copy }: LandingContactSectionProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [website, setWebsite] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setIsSuccess(false);

        try {
            const result = await submitContactInquiry({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim() || undefined,
                subject: subject.trim(),
                message: message.trim(),
                website: website.trim() || undefined,
            });

            setIsSuccess(true);
            toast.success(result.message || copy.success);
            setName('');
            setEmail('');
            setPhone('');
            setSubject('');
            setMessage('');
        } catch (error) {
            if (error instanceof ApiError && error.status === 429) {
                toast.error(copy.rateLimit);
                return;
            }

            const messageText =
                error instanceof ApiError ? error.message : copy.error;
            toast.error(messageText);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="hubungi-kami" className="py-24 lg:py-28 bg-transparent">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="brutal-card bg-white p-8 lg:p-10">
                        <div className="mb-8 text-center">
                            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#1C1C1C]/60 mb-4">
                                <Mail className="h-3.5 w-3.5" aria-hidden />
                                {copy.label}
                            </span>
                            <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1C1C] mb-4">
                                {copy.title}
                            </h2>
                            <p className="text-[#1C1C1C]/75 leading-relaxed">{copy.description}</p>
                        </div>

                        {isSuccess ? (
                            <div
                                role="status"
                                className="rounded-sm border-2 border-emerald-600 bg-emerald-50 px-5 py-4 text-center text-sm font-semibold text-emerald-800"
                            >
                                {copy.success}
                            </div>
                        ) : null}

                        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                            <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden>
                                <label htmlFor="contact-website">Website</label>
                                <input
                                    id="contact-website"
                                    type="text"
                                    name="website"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="contact-name" className="brutal-label">
                                        {copy.name}
                                    </label>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        required
                                        maxLength={120}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={inputClassName}
                                        autoComplete="name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="contact-email" className="brutal-label">
                                        {copy.email}
                                    </label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        required
                                        maxLength={255}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={inputClassName}
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="contact-phone" className="brutal-label">
                                    {copy.phone}{' '}
                                    <span className="normal-case tracking-normal text-[#1C1C1C]/50">
                                        ({copy.phoneOptional})
                                    </span>
                                </label>
                                <input
                                    id="contact-phone"
                                    type="tel"
                                    maxLength={30}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className={inputClassName}
                                    autoComplete="tel"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="contact-subject" className="brutal-label">
                                    {copy.subject}
                                </label>
                                <input
                                    id="contact-subject"
                                    type="text"
                                    required
                                    maxLength={200}
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder={copy.subjectPlaceholder}
                                    className={inputClassName}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="contact-message" className="brutal-label">
                                    {copy.message}
                                </label>
                                <textarea
                                    id="contact-message"
                                    required
                                    rows={5}
                                    maxLength={5000}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={copy.messagePlaceholder}
                                    className={`${inputClassName} min-h-[140px] resize-y`}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="brutal-btn h-12 w-full rounded-sm px-6 text-sm disabled:pointer-events-none disabled:opacity-70"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                        {copy.submitting}
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" aria-hidden />
                                        {copy.submit}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}