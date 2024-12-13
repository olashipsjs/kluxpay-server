import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

const render = (
  templateName: string,
  data?: { [key: string]: string | number }
) => {
  const partialsDirectory = path.resolve(
    __dirname,
    '../views/templates/partials'
  );
  fs.readdirSync(partialsDirectory).forEach((file) => {
    const partialName = path.basename(file, '.html');
    const partialContent = fs.readFileSync(
      path.join(partialsDirectory, file),
      'utf8'
    );
    Handlebars.registerPartial(partialName, partialContent);
  });

  const templatePath = path.resolve(
    __dirname,
    `../views/templates/${templateName}.html`
  );

  const content = fs.readFileSync(templatePath, 'utf8');

  const template = Handlebars.compile(content);

  const dynamicTemplate = template(data);

  return dynamicTemplate;
};

export default render;
