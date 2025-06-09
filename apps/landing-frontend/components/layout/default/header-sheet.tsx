import { Sheet, SheetContent, SheetTrigger } from '@repo/landing-ui/src/sheet';
import { ThemeToggle } from '#components/layout/default/header-theme-toggle';
import { MAIN_HEADER } from '@repo/shared/wiki/data/configs';
import { Typography } from '@repo/landing-ui/src/typography';
import { useState } from 'react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui/src/components/accordion';
import { usePathname, useRouter } from 'next/navigation';

const ExperienceCircle = () => {
  return (
    <img src="/images/minecraft/icons/experience_big.webp" width={16} height={16} loading="lazy" alt="" />
  )
}

export const HeaderSheet = () => {
  const [ open, setOpen ] = useState(false);
  const { push } = useRouter();
  const pathname = usePathname();
  
  const chestStatusImage = open
    ? '/images/minecraft/icons/chest_opened.webp'
    : '/images/minecraft/icons/chest_closed.webp';
  
  const handleToPage = (href: string | null) => {
    if (href) {
      push(href);
      setOpen(!open);
    }
  };
  
  return (
    <Sheet modal open={open} onOpenChange={setOpen}>
      <SheetTrigger name="trigger" id="trigger" className="xl:hidden absolute top-[10px] right-[8px] z-[3000]">
        <img
          src={chestStatusImage}
          alt=""
          width={48}
          height={48}
          loading="lazy"
        />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="xl:hidden flex flex-col items-start
        justify-between theme-background rounded-[16px] min-h-1/2 h-fit p-4 w-full"
      >
        <div className="flex justify-between px-2 items-center w-full">
          <Link href="/" className="bg-transparent cursor-pointer right-6 relative top-2">
            <img src="/images/fasberry_logo.webp" alt="Fasberry" width={224} height={64} loading="lazy" />
          </Link>
          <div className="w-[36px] h-[36px] relative">
            <ThemeToggle />
          </div>
        </div>
        <Accordion
          type="single"
          collapsible
          className="flex flex-col items-center justify-center w-full gap-4 px-4"
        >
          {MAIN_HEADER.map(({ name, href, childs }) => {
            const isActive = href === pathname;
            
            return (
              <AccordionItem key={name} value={name} className="w-full">
                <AccordionTrigger
                  onClick={() => handleToPage(href!)}
                  className="flex border-2 border-neutral-600 hover:bg-neutral-600 group bg-neutral-800
                   rounded-md gap-x-6 py-2 px-2 w-full"
                >
                  <div className="flex items-center gap-1">
                    {isActive && <ExperienceCircle />}
                    <Typography size="lg" className={href === '/shop' ? 'text-gold' : 'text-white'}>
                      {name}
                    </Typography>
                    {childs && (
                      <>
                        <span className="text-white group-data-[state=open]:inline hidden">⏶</span>
                        <span className="text-white group-data-[state=closed]:inline hidden">⏷</span>
                      </>
                    )}
                  </div>
                </AccordionTrigger>
                {childs && (
                  <AccordionContent className="flex flex-col gap-2 pt-1">
                    {childs.map(({ name, href }) => {
                      const isActive = href === pathname;
                      
                      return (
                        <div
                          key={name}
                          onClick={() => handleToPage(href!)}
                          className="flex group border-2 border-neutral-600
                           hover:bg-neutral-600 bg-neutral-800 cursor-pointer rounded-md gap-x-6 p-2 w-full"
                        >
                          <div className="flex items-center gap-1">
                            {isActive && <ExperienceCircle />}
                            <Typography size="lg" className="text-white">
                              {name}
                            </Typography>
                            {childs && (
                              <>
                                <span className="text-white group-data-[state=open]:inline hidden">⏶</span>
                                <span className="text-white group-data-[state=closed]:inline hidden">⏷</span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </AccordionContent>
                )}
              </AccordionItem>
            );
          })}
        </Accordion>
      </SheetContent>
    </Sheet>
  );
};