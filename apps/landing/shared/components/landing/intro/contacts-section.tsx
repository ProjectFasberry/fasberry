import { CONTACTS_LIST, ContactsListProps } from '@repo/shared/wiki/data/contacts/contacts-list';
import { Link } from "@/shared/components/config/Link";
import { Typography } from '@repo/ui/typography';

const ContactItem = ({ content, name, href }: ContactsListProps) => {
  return (
    <div className="flex flex-col bg-neutral-900 h-full justify-between rounded-xl p-4 lg:p-6">
      <div className="flex flex-col mb-4">
        <Typography className="text-neutral-50 text-3xl lg:text-4xl xl:text-5xl mb-4">
          {name}
        </Typography>
        <h1 className="text-[#5CC85C] text-lg xl:text-3xl">плюсы:</h1>
        {content.pluses && content.pluses.map((plus, plusIndex) => (
          <p key={plusIndex} className="text-[14px] lg:text-lg">
            &gt;&nbsp;{plus}
          </p>
        ))}
        <h1 className="mt-2 xl:mt-3 text-rose-500 text-lg xl:text-3xl">минусы:</h1>
        {content.minuses && content.minuses.map((minus, minusIndex) => (
          <Typography key={minusIndex} className="text-[14px] lg:text-lg">
            &gt;&nbsp;{minus}
          </Typography>
        ))}
      </div>
      <div className="flex w-full items-center justify-center lg:justify-start">
        <Link
          href={href}
          className="flex w-fit gap-4 *:ease-in-out *:duration-300 *:group-hover:duration-300 *:transition-all rounded-xl px-8 items-center gap-x-4 group
          border-2 hover:border-white/80 border-white/60 py-4"
        >
          <Typography className="text-lg text-white/60 group-hover:text-white/80">
            Перейти в {name}
          </Typography>
          <span
            className="text-[18px] text-white/60 group-hover:text-white/80"
          >
            {`>`}
          </span>
        </Link>
      </div>
    </div>
  );
};

export const ContactsSection = () => {
  return (
    <div
      id="contacts"
      className="full-screen-section min-h-screen relative flex flex-col items-center justify-center py-32 xl:py-0"
    >
      <div className="flex flex-col gap-y-12 responsive">
        <h2 className="text-2xl sm:text-3xl md:text-6xl lg:text-6xl xl:text-7xl text-center text-red">
          Где ещё существует проект?
        </h2>
        <div className="flex flex-col lg:flex-row gap-x-4 gap-y-6 justify-between">
          {CONTACTS_LIST.map(contact =>
            <ContactItem key={contact.name} {...contact} />)
          }
        </div>
      </div>
    </div>
  )
}