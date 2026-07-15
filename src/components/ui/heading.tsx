interface HeadingProps {
    title: string;
    description: string;
}

export const Heading: React.FC<HeadingProps> = ({ title, description }) => {
    return (
        <div className='min-w-0'>
            <h2 className='text-xl font-bold tracking-tight break-words sm:text-2xl md:text-3xl'>{title}</h2>
            {description ? (
                <p className='text-muted-foreground text-sm break-words'>{description}</p>
            ) : null}
        </div>
    );
};
