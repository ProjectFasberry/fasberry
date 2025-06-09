import { Typography } from '@repo/landing-ui/src/typography';
import Link from 'next/link';
import { Fragment } from 'react';

const FOOTER_LINKS = [
  { name: 'Конфиденциальность', href: '/privacy' },
  { name: 'Соглашение', href: '/terms' },
  { name: 'Контакты', href: '/contacts' },
  { name: 'Благодарности', href: '/credits' },
];

export const Footer = async() => {
  return (
    <footer
      className="sticky flex-col flex justify-center items-center gap-6 pt-10 pb-6 bg-[url('/images/static/bedrock.webp')]"
      style={{ backgroundSize: '160px' }}
    >
      <div className="flex flex-col lg:flex-row justify-center items-center responsive mx-auto">
        <Link href="/" className="overflow-hidden">
          <img
            width={316}
            height={128}
            alt="Fasberry Project Logo"
            src="/images/fasberry_logo.webp"
            className="relative top-4 cursor-pointer"
            loading="lazy"
          />
        </Link>
      </div>
      <div className="flex flex-col justify-center items-center lg:flex-row responsive gap-4 mx-auto">
        {FOOTER_LINKS.map(({ name, href }, idx) => (
          <Fragment key={href}>
            <Link href={`/info/${href}`}>
              <Typography className="text-white">
                {name}
              </Typography>
            </Link>
            {idx < FOOTER_LINKS.length - 1 &&
              <span className="text-white hidden lg:block mx-2">⏺</span>
            }
          </Fragment>
        ))}
      </div>
      <div className="flex flex-col justify-center gap-2 responsive mx-auto">
        <Typography className="text-center text-white">
          Все права защищены. Оригинальные права принадлежат Mojang AB.
        </Typography>
      </div>
    </footer>
  );
};