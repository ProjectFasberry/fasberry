import { Typography } from "@repo/ui/typography";

type RulesRuleItemContent = {
  title: string,
  punishment: string,
  description: string,
  id: string
}

export const RulesRuleItemContent = ({
  title, punishment, description, id
}: RulesRuleItemContent) => {
  return (
    <div className="flex flex-col mb-6 lg:mb-4">
      <div className="flex-col flex gap-1">
        <p className="text-project-color text-md md:text-lg">
          {id}{`)`}&nbsp;
          <span className="text-white">{title}</span>
        </p>
        {description &&
          <Typography color="gray" className="inline-block">[?] {description}</Typography>
        }
        {punishment && (
          <div className="flex flex-row gap-1 items-start md:items-center">
            <Typography color="white" className="relative top-0.5 text-sm md:text-lg">
              <span className="text-red mr-2">Наказание:</span>
              {punishment}
            </Typography>
          </div>
        )}
      </div>
    </div>
  )
}

export const RulesRuleItem = ({
  categoryTitle, content,
}: { categoryTitle: string, content: Array<any> }) => {
  if (!content) return null;

  return (
    <div id={categoryTitle} className="flex flex-col p-2 md:p-4 border-2 border-[#454545]">
      <h1 className="text-gold text-xl md:text-4xl mb-6">{categoryTitle}</h1>
      {content.map(i => <RulesRuleItemContent key={i.id} {...i} />)}
    </div>
  );
};