import { MAIN_HEADER } from '@repo/shared/wiki/data/configs';
import { usePageContext } from 'vike-react/usePageContext';
import { navigate } from 'vike/client/router';
import { Link } from '@/shared/components/config/Link';
import { atom } from '@reatom/core';
import { reatomComponent } from '@reatom/npm-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@repo/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui/accordion';

const ExperienceCircle = () => {
  return (
    <img src="/images/minecraft/icons/experience_big.webp" width={16} height={16} alt="" />
  )
}

const Content = reatomComponent(({ ctx }) => {
  const pathname = usePageContext().urlParsed.pathname;

  const handleToPage = (href: string | null) => {
    if (!href) return;

    navigate(href);
    sheetIsOpenAtom(ctx, state => !state);
  };

  return (
    <>
      <div className="flex justify-between px-2 items-center w-full">
        <Link href="/" className="bg-transparent right-6 relative top-2">
          <img src="/images/fasberry_logo.webp" alt="Fasberry" width={224} height={64} />
        </Link>
      </div>
      <Accordion type="single" collapsible className="flex flex-col items-center justify-center w-full gap-4 px-4">
        {MAIN_HEADER.map(({ name, href, childs }) => (
          <AccordionItem key={name} value={name} className="w-full">
            <AccordionTrigger
              onClick={() => handleToPage(href)}
              className="flex border-2 border-neutral-600 hover:bg-neutral-600 group bg-neutral-800 rounded-md gap-6 py-2 px-2 w-full"
            >
              <div className="flex items-center gap-1">
                {href === pathname && <ExperienceCircle />}
                <p data-state={href} className="text-white data-[state=/shop]:text-gold text-lg">
                  {name}
                </p>
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
                {childs.map(({ name, href }) => (
                  <div
                    key={name}
                    onClick={() => handleToPage(href!)}
                    className="flex group border-2 border-neutral-600 hover:bg-neutral-600 bg-neutral-800 
                      cursor-pointer rounded-md gap-6 p-2 w-full"
                  >
                    <div className="flex items-center gap-1">
                      {href === pathname && <ExperienceCircle />}
                      <p className="text-lg text-white">
                        {name}
                      </p>
                      {childs && (
                        <>
                          <span className="text-white group-data-[state=open]:inline hidden">⏶</span>
                          <span className="text-white group-data-[state=closed]:inline hidden">⏷</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </AccordionContent>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </>
  )
}, "Content")

const sheetIsOpenAtom = atom(false, "sheetIsOpenAtom")

export const HeaderSheet = reatomComponent(({ ctx }) => {
  const isOpen = ctx.spy(sheetIsOpenAtom)

  const chestStatusImage = isOpen
    ? '/images/minecraft/icons/chest_opened.webp'
    : '/images/minecraft/icons/chest_closed.webp';

  return (
    <Sheet modal open={isOpen} onOpenChange={v => sheetIsOpenAtom(ctx, v)}>
      <SheetTrigger className="xl:hidden absolute top-[10px] right-[8px] z-[3000]">
        <img src={chestStatusImage} alt="" width={48} height={48} />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="xl:hidden flex border-none flex-col items-start justify-between bg-neutral-950 rounded-xl min-h-1/3 h-fit p-4 w-full"
      >
        <SheetTitle className="hidden"></SheetTitle>
        <Content />
      </SheetContent>
    </Sheet>
  );
}, "HeaderSheet")