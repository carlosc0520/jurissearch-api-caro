import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { translate } from 'bing-translate-api';
import { HttpService } from '@nestjs/axios';
import { getGender } from 'gender-detection-from-name';
import * as ExcelJS from 'exceljs';
import * as nodemailer from 'nodemailer';

@Controller('complytools')
export class ComplytoolsController {
  private transporter: nodemailer.Transporter;
  private AMBIT = "PROD" // PROD
  private CONFIG = {
    "DEV": {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
      dumpio: true,
    },
    "PROD": {
      executablePath: '/usr/bin/chromium-browser',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  }
  private Proxys: { [key: string]: any };

  constructor(private readonly httpService: HttpService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_JURIS1,
        pass: process.env.EMAIL_JURIS1_PASSWORD1,
      },
      tls: {
        rejectUnauthorized: false, // Desactiva la verificación del certificado
      },
    });
    this.Proxys = {
      'proxy-1': 'https://diariooficial.elperuano.pe/Normas',
      'proxy-2': 'https://www.dea.gov/fugitives/all',
      'proxy-3': (year: string) => {
        let url = `https://www.fbi.gov/wanted/fugitives/@@castle.cms.querylisting/f7f80a1681ac41a08266bd0920c9d9d8?display_type=wanted-feature-grid&_layouteditor=true&limit=40&available_tags=%28u%27Crimes+Against+Children%27%2C+u%22Cyber%27s+Most+Wanted%22%2C+u%27White-Collar+Crime%27%2C+u%27Counterintelligence%27%2C+u%27Human+Trafficking%27%2C+u%27Criminal+Enterprise+Investigations%27%2C+u%27Violent+Crime+-+Murders%27%2C+u%27Additional+Violent+Crimes%27%29&query.v:records=%2Fwanted%2Fcac%3A%3A-1&query.o:records=plone.app.querystring.operation.string.absolutePath&query.i:records=path&query.v:records=%2Fwanted%2Fcei%3A%3A-1&query.o:records=plone.app.querystring.operation.string.absolutePath&query.i:records=path&query.v:records=%2Fwanted%2Fcyber%3A%3A-1&query.o:records=plone.app.querystring.operation.string.absolutePath&query.i:records=path&query.v:records=%2Fwanted%2Fmurders%3A%3A-1&query.o:records=plone.app.querystring.operation.string.absolutePath&query.i:records=path&query.v:records=%2Fwanted%2Fadditional%3A%3A-1&query.o:records=plone.app.querystring.operation.string.absolutePath&query.i:records=path&query.v:records=%2Fwanted%2Fcounterintelligence%3A%3A-1&query.o:records=plone.app.querystring.operation.string.absolutePath&query.i:records=path&query.v:records=%2Fwanted%2Fwcc%3A%3A-1&query.o:records=plone.app.querystring.operation.string.absolutePath&query.i:records=path&query.v:records=%2Fwanted%2Fhuman-trafficking%3A%3A-1&query.o:records=plone.app.querystring.operation.string.absolutePath&query.i:records=path&query.v:records=%5Bu%27Person%27%5D&query.o:records=plone.app.querystring.operation.selection.any&query.i:records=portal_type&query.v:records=%5Bu%27published%27%5D&query.o:records=plone.app.querystring.operation.selection.any&query.i:records=review_state&display_fields=%28%27image%27%2C%29&sort_on=modified&selected-year=${year}`;
        return url;
      },
      'proxy-4': (year: string) => {
        let url = `https://www.fbi.gov/wanted/terrorism/@@castle.cms.querylisting/55d8265003c84ff2a7688d7acd8ebd5a?display_fields=%28%27image%27%2C%29&_layouteditor=true&query.o:records=plone.app.querystring.operation.selection.any&query.v:records=%5Bu%27Person%27%5D&query.i:records=portal_type&query.o:records=plone.app.querystring.operation.selection.any&query.v:records=%5Bu%27Domestic+Terrorism%27%2C+u%27Most+Wanted+Terrorists%27%2C+u%27Seeking+Information+-+Terrorism%27%5D&query.i:records=Subject&query.o:records=plone.app.querystring.operation.selection.any&query.v:records=%5Bu%27published%27%5D&query.i:records=review_state&limit=40&sort_on=modified&display_type=wanted-feature-grid&available_tags=%28u%27Most+Wanted+Terrorists%27%2C+u%27Seeking+Information+-+Terrorism%27%2C+u%27Domestic+Terrorism%27%29&selected-year=${year}`;
        return url;
      },
      'proxy-5':
        'https://www.interpol.int/es/Como-trabajamos/Notificaciones/Notificaciones-rojas/Ver-las-notificaciones-rojas#',
      'proxy-6':
        'https://www.sbs.gob.pe/prevencion-de-lavado-activos/Procedimientos-Sancionadores',
      'proxy-7': 'https://www.recompensas.pe/requisitoriados/list/F-',
      'proxy-8': 'http://www.osce.gob.pe/consultasenlinea/inhabilitados/',
      'proxy-9':
        'https://rnas.minjus.gob.pe/rnas/public/sancionado/sancionadoMain.xhtml',
    };
  }

  @Get('proxy-1')
  async Proxy1(@Query() entidad: any, @Res() res): Promise<void> {
    const proxyUrl = this.Proxys['proxy-1'];
    if (!proxyUrl) {
      throw new Error('El proxy solicitado no existe.');
    }

    const browserP = puppeteer.launch({...this.CONFIG[this.AMBIT]});

    (async () => {
      let page = await (await browserP).newPage();
      await page.setUserAgent(
        '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
      );
      await page.goto(proxyUrl);
      await page.waitForSelector('#cddesde');
      await page.waitForSelector('#cdhasta');
      await page.waitForSelector('#btnBuscar');

      await page.evaluate(() => {
        document.getElementById('cddesde')['value'] = '';
        document.getElementById('cdhasta')['value'] = '';
      });

      await page.type('#cddesde', entidad.cddesde);
      await page.type('#cdhasta', entidad.cdhasta);

      await page.click('#btnBuscar', { delay: 6000 });
      await page.waitForSelector('.edicionesoficiales_articulos', {
        visible: true,
        timeout: 30000,
      });

      let data = await page.evaluate(() => {
        let elements = document.querySelectorAll(
          '.edicionesoficiales_articulos',
        );
        let data = [];

        elements.forEach((element) => {
          let title = element.querySelector('h4')
            ? element.querySelector('h4').textContent.replace(/\n/g, '').trim()
            : '';

          let resolucion = element.querySelector('h5 a')
            ? element
                .querySelector('h5 a')
                .textContent.replace(/\n/g, '')
                .trim()
            : '';

          let link = element.querySelector('a')
            ? element.querySelector('a').href.replace(/\n/g, '').trim()
            : '';
          let date = element.querySelector('p b')
            ? element
                .querySelector('p b')
                .textContent.replace(/\n/g, '')
                .trim()
                .replace('Fecha: ', '')
            : '';
          let description = element.querySelectorAll('p')[1]
            ? element
                .querySelectorAll('p')[1]
                .textContent.replace(/\n/g, '')
                .trim()
            : '';

          data.push({
            title,
            link,
            date,
            description,
            resolucion,
          });
        });

        return {
          data,
          status: true,
        };
      });

      res.status(200).send(data);
    })()
      .catch((error) => {
        res.status(500).send({
          status: false,
          message: 'Error al extraer los datos.',
        });
        // console.error('Error al extraer los datos:', error);
      })
      .finally(async () => {
        await (await browserP).close();
      });
  }

  @Get('proxy-2')
  async Proxy2(@Query() entidad: any, @Res() res): Promise<void> {
    const proxyUrl = this.Proxys['proxy-2'];
    if (!proxyUrl) {
      res.status(400).send({
        status: false,
        message: 'El proxy solicitado no existe.',
      });
      return;
    }

    const browserP = puppeteer.launch({...this.CONFIG[this.AMBIT]});

    (async () => {
      const browser = await browserP;

      const scrapePage = async (pageUrl: string) => {
        const page = await browser.newPage();
        try {
          await page.setUserAgent(
            '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
          );
          await page.setExtraHTTPHeaders({
            'Accept-Language': 'es',
          });

          await page.goto(pageUrl);

          const data = await page.evaluate(() => {
            const elements = document.querySelectorAll('.l-view__row');
            const extractedData = [];

            elements.forEach((element) => {
              const categoria = element.querySelector('.teaser__category');
              const nombres = element.querySelector('h3.teaser__heading a');
              const link = element.querySelector('h3.teaser__heading a');
              const text = element.querySelector('.teaser__text');

              extractedData.push({
                categoria: categoria
                  ? categoria.textContent.replace(/\n/g, '').trim()
                  : '',
                nombre: nombres
                  ? nombres.textContent.replace(/\n/g, '').trim()
                  : '',
                link: link ? link['href']?.replace(/\n/g, '').trim() : '',
                text: text ? text.textContent.replace(/\n/g, '').trim() : '',
              });
            });

            return extractedData;
          });

          return data;
        } catch (error) {
          // console.error(`Error en la página ${pageUrl}:`, error);
          return [];
        } finally {
          await page.close();
        }
      };

      try {
        const pageUrls = [`${proxyUrl}?page=0`, `${proxyUrl}?page=2`];
        const [dataPage0, dataPage2] = await Promise.all(
          pageUrls.map((url) => scrapePage(url)),
        );

        let combinedData = [...dataPage0, ...dataPage2];

        combinedData = await Promise.all(
          combinedData.map(async (item, index) => {
            try {
              const translation = await translate(
                item.text || '',
                'en',
                'es',
              ).then((res) => res.translation || '');
              const categoryTranslation = await translate(
                item.categoria || '',
                'en',
                'es',
              ).then((res) => res.translation || '');

              return {
                ...item,
                rn: index + 1,
                categoria: categoryTranslation,
                text: translation,
              };
            } catch (error) {
              // console.error('Error al traducir:', error);
              return {
                ...item,
                rn: index + 1,
                categoria: item.categoria || '',
                text: item.text || '',
              };
            }
          }),
        );

        res.status(200).send({
          data: combinedData,
          status: true,
        });
      } catch (error) {
        // console.error('Error al extraer los datos:', error);
        res.status(500).send({
          status: false,
          message: 'Error al extraer los datos.',
          data: [],
        });
      } finally {
        await browser.close();
      }
    })();
  }

  @Get('proxy-2-2')
  async Proxy2_2(@Query() entidad: any, @Res() res): Promise<void> {
    const proxyUrl = entidad.completo;

    if (!proxyUrl) {
      res.status(400).send({
        status: false,
        message: 'El proxy solicitado no existe.',
      });
      return;
    }

    const browserP = puppeteer.launch({...this.CONFIG[this.AMBIT]});

    (async () => {
      const browser = await browserP;
      const page = await browser.newPage();

      try {
        await page.setUserAgent(
          '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
        );
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'es',
        });
        await page.goto(proxyUrl);

        const data = await page.evaluate(() => {
          try {
            let sex = '';
            let identificacion = '';
            let nacionalidad = '';
            let alias = '';

            try {
              alias =
                document
                  .querySelector('div.fugitive__content div div')
                  ?.textContent.replace(/\n/g, '')
                  .trim() || '';
            } catch (e) {
              alias = '';
            }

            const rows = document.querySelectorAll(
              'div.fugitive__content table tbody tr',
            );

            rows.forEach((row) => {
              const cells = Array.from(row.querySelectorAll('td'));

              const sexCell = cells.find(
                (td) => td.textContent.trim() === 'Sex',
              );
              if (sexCell?.nextElementSibling) {
                sex = sexCell.nextElementSibling.textContent.trim();
              }

              const identificacionCell = cells.find(
                (td) => td.textContent.trim() === 'NCIC #',
              );
              if (identificacionCell?.nextElementSibling) {
                identificacion =
                  identificacionCell.nextElementSibling.textContent.trim();
              }

              const nacionalidadCell = cells.find(
                (td) => td.textContent.trim() === 'Last Known Address',
              );
              if (nacionalidadCell?.nextElementSibling) {
                nacionalidad =
                  nacionalidadCell.nextElementSibling.textContent.trim();
              }
            });

            return {
              genero: sex === 'Male' ? 'M' : sex === 'Female' ? 'F' : '',
              identificacion: identificacion || '',
              nacionalidad: nacionalidad || '',
              alias: alias || '',
            };
          } catch (error) {
            // console.error('Error evaluando la página:', error);
            return {
              genero: '',
              identificacion: '',
              nacionalidad: '',
              alias: '',
            };
          }
        });

        if (data?.['nacionalidad']) {
          data['nacionalidad'] = await translate(
            data['nacionalidad'],
            'en',
            'es',
          ).then((res) => res.translation);
        }

        res.status(200).send({
          data,
          proxyUrl,
          status: true,
        });
      } catch (error) {
        // console.error('Error al extraer los datos:', error);
        res.status(500).send({
          status: false,
          message: 'Error al extraer los datos.',
          data: {
            genero: '',
            identificacion: '',
            nacionalidad: '',
            alias: '',
          },
        });
      } finally {
        await browser.close();
      }
    })();
  }

  @Get('proxy-3')
  async Proxy3(@Query() entidad: any, @Res() res): Promise<void> {
    // Validar 'year'
    if (!entidad.year || isNaN(entidad.year)) {
      return res.status(400).send({
        status: false,
        message: 'El año no es válido.',
      });
    }

    const proxyUrl = this.Proxys[`proxy-${entidad.proxy}`](entidad.year);

    if (!proxyUrl) {
      return res.status(400).send({
        status: false,
        message: 'El proxy solicitado no existe.',
      });
    }

    const browserP = puppeteer.launch({...this.CONFIG[this.AMBIT]});

    (async () => {
      const browser = await browserP;

      // Función de scraping
      const scrapePage = async (pageUrl: string) => {
        const page = await browser.newPage();

        await page.setUserAgent(
          '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
        );
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'es',
        });

        try {
          await page.goto(pageUrl);
          const data = await page.evaluate(() => {
            const elements = document.querySelectorAll(
              '.castle-grid-block-item',
            );
            return Array.from(elements).map((element) => {
              const title = element.querySelector('h3.title');
              const nombre = element.querySelector('p.name a');
              const link = element.querySelector('a');

              return {
                title: title ? title.textContent.replace(/\n/g, '').trim() : '',
                nombre: nombre
                  ? nombre.textContent.replace(/\n/g, '').trim()
                  : '',
                link: link ? link['href']?.replace(/\n/g, '').trim() : '',
              };
            });
          });
          return data;
        } catch (error) {
          // console.error('Error en la extracción de datos de la página:', error);
          return [];
        } finally {
          await page.close();
        }
      };

      try {
        let data = await scrapePage(proxyUrl);

        // Traducir los títulos
        data = await Promise.all(
          data.map(async (item, index) => {
            try {
              const translation = await translate(item.title, 'en', 'es');
              return {
                ...item,
                rn: index + 1,
                title: translation.translation || item.title,
              };
            } catch (translationError) {
              // console.error('Error al traducir el título:', translationError);
              return {
                ...item,
                rn: index + 1,
                title: item.title,
              };
            }
          }),
        );

        res.status(200).send({
          data,
          status: true,
        });
      } catch (error) {
        // console.error('Error al extraer los datos:', error);
        res.status(500).send({
          status: false,
          message: 'Error al extraer los datos.',
        });
      } finally {
        await browser.close();
      }
    })();
  }

  @Get('proxy-3-3')
  async Proxy3_3(@Query() entidad: any, @Res() res): Promise<void> {
    if (!entidad.completo) {
      res.status(400).send({
        status: false,
        message: 'El proxy solicitado no existe.',
      });
      return;
    }

    const proxyUrl = entidad.completo;

    const browserP = puppeteer.launch({...this.CONFIG[this.AMBIT]});

    (async () => {
      const browser = await browserP;
      const page = await browser.newPage();

      try {
        await page.setUserAgent(
          '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
        );
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'es',
        });
        await page.goto(proxyUrl);

        const data = await page.evaluate(() => {
          try {
            let alias =
              document
                .querySelector('.wanted-person-aliases p')
                ?.textContent.replace(/\n/g, '')
                .replace(/"/g, '')
                .trim() || '';
            let rows = document.querySelectorAll(
              'table.wanted-person-description tbody tr',
            );

            let sexo = '';
            let nacionalidad = '';
            let etiquetasMas = document.querySelectorAll(
              '.wanted-person-caution p',
            );
            let etiquetasMas2 = document.querySelectorAll(
              '.wanted-person-details p',
            );

            let mas = '';
            let mas2 = '';

            etiquetasMas?.forEach((etiqueta) => {
              mas += etiqueta.textContent.replace(/\n/g, '').trim() + ' ';
            });

            etiquetasMas2?.forEach((etiqueta) => {
              mas2 += etiqueta.textContent.replace(/\n/g, '').trim() + ' ';
            });

            rows.forEach((row) => {
              let cells = Array.from(row.querySelectorAll('td'));

              let sexCell = cells.find((td) => td.textContent.trim() == 'Sex');
              if (sexCell?.nextElementSibling) {
                sexo = sexCell.nextElementSibling.textContent.trim();
              }

              let nacionalidadCell = cells.find(
                (td) => td.textContent.trim() == 'Nationality',
              );
              if (nacionalidadCell?.nextElementSibling) {
                nacionalidad =
                  nacionalidadCell.nextElementSibling.textContent.trim();
              }
            });

            return {
              mas: mas,
              mas2: mas2,
              genero: sexo == 'Male' ? 'M' : sexo == 'Female' ? 'F' : '',
              nacionalidad: nacionalidad,
              alias: alias,
              identificacion: '',
            };
          } catch (error) {
            // console.error('Error evaluando la página:', error);
            return [];
          }
        });

        if (data?.['mas'] && data?.['mas'].length > 0 && entidad.proxy == '3') {
          try {
            data['mas'] = await translate(data['mas'], 'en', 'es').then(
              (res) => res.translation,
            );
          } catch (error) {
            // console.error('Error al traducir:', error);
          }
        }

        if (
          data?.['mas2'] &&
          data?.['mas2'].length > 0 &&
          entidad.proxy == '4'
        ) {
          try {
            data['mas'] = await translate(data['mas2'], 'en', 'es').then(
              (res) => res.translation,
            );
          } catch (error) {
            // console.error('Error al traducir:', error);
          }
        }

        if (data?.['nacionalidad']) {
          data['nacionalidad'] = await translate(
            data['nacionalidad'],
            'en',
            'es',
          ).then((res) => res.translation);
        }

        res.status(200).send({
          data,
          proxyUrl,
          status: true,
        });
      } catch (error) {
        // console.error('Error al extraer los datos:', error);
        res.status(500).send({
          status: false,
          message: 'Error al extraer los datos.',
          data: [],
        });
      } finally {
        await browser.close();
      }
    })();
  }

  @Get('proxy-6')
  async Proxy6(@Query() entidad: any, @Res() res): Promise<void> {
    const proxyUrl = this.Proxys['proxy-6'];
    if (!proxyUrl) {
      res.status(400).send({
        status: false,
        message: 'El proxy solicitado no existe.',
      });
      return;
    }

    const browserP = puppeteer.launch({...this.CONFIG[this.AMBIT]});

    (async () => {
      const browser = await browserP;

      const scrapePage = async (pageUrl: string) => {
        const page = await browser.newPage();
        try {
          await page.setUserAgent(
            '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
          );
          await page.setExtraHTTPHeaders({
            'Accept-Language': 'es',
          });

          await page.goto(pageUrl);

          const data = await page.evaluate(() => {
            const elements = document.querySelectorAll('li a');

            let link = '';
            elements.forEach((element) => {
              if (element?.['href'].includes('.xlsx')) {
                link = element?.['href'];
              }
            });

            return link;
          });

          return data;
        } catch (error) {
          // console.error(`Error en la página ${pageUrl}:`, error);
          return [];
        }
      };

      try {
        const data = await scrapePage(proxyUrl);

        res.status(200).send({
          data,
          status: true,
          proxyUrl,
        });
      } catch (error) {
        // console.error('Error al extraer los datos:', error);
        res.status(500).send({
          status: false,
          message: 'Error al extraer los datos.',
          data: [],
        });
      } finally {
        await browser.close();
      }
    })();
  }

  @Get('proxy-7')
  async Proxy7(@Query() entidad: any, @Res() res): Promise<void> {
    const proxyUrl = this.Proxys['proxy-7'];
    let browserP;
    let page;

    try {
      browserP = await puppeteer.launch({...this.CONFIG[this.AMBIT]});

      page = await browserP.newPage();
      await page.setUserAgent(
        '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
      );

      await page.setExtraHTTPHeaders({
        'Accept-Language': 'es',
      });

      await page.setRequestInterception(true);
      page.on('request', (request) => {
        if (
          request
            .url()
            .includes(
              'https://sispasvehapp.mininter.gob.pe/api-recompensas/requisitoriados/pageandfilter',
            ) &&
          request.method() !== 'OPTIONS'
        ) {
          const postData = request.postData();
          if (postData) {
            const data = JSON.parse(postData);
            data.pageInfo.page = 1; // Cambiar la página
            data.pageInfo.size = 30; // Cambiar el tamaño
            request.continue({ postData: JSON.stringify(data) });
          } else {
            request.continue();
          }
        } else {
          request.continue();
        }
      });

      await page.on('response', async (response) => {
        if (
          response
            .url()
            .includes(
              'https://sispasvehapp.mininter.gob.pe/api-recompensas/requisitoriados/pageandfilter',
            ) &&
          response.request().method() !== 'OPTIONS'
        ) {
          try {
            const data = await response.json();
            const registros = data?.content || [];

            res.status(200).send({
              data: registros,
              status: true,
            });

            await page.close();
            await browserP.close();
          } catch (error) {
            res
              .status(500)
              .send({ error: 'Error al procesar la respuesta del servidor' });
          }
        }
      });

      await page.goto(proxyUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 100000,
      });
      try {
        await page.waitForSelector('h5', { timeout: 10000 });
      } catch (error) {}
    } catch (error) {
      console.log(error)
      res.status(500).send({ error: 'Error durante la ejecución del proxy' });
    } finally {
      await browserP.close();
    }
  }

  @Post('proxy-7-7')
  async Proxy7_7(@Body() entidad: any, @Res() res): Promise<void> {
    try {
      let hashIds = JSON.parse(entidad.entidad);

      const browser = await puppeteer.launch({...this.CONFIG[this.AMBIT]});

      const scrapePage = async (pageUrl: string) => {
        const page = await browser.newPage();
        try {
          await page.setUserAgent(
            '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
          );
          await page.setExtraHTTPHeaders({
            'Accept-Language': 'es',
          });

          await page.goto(pageUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 10000,
          });

          await page.waitForSelector('body', { timeout: 1300 });
          await page.waitForFunction(
            () => {
              const bodyText =
                document.querySelector('body')?.textContent || '';
              const sexoMath = [
                'Sexo:  Femenino  Lugar de RQ',
                'Sexo:  Masculino  Lugar de RQ',
              ];
              return sexoMath.some((sexo) => bodyText.includes(sexo));
            },
            { timeout: 5000 },
          );

          const data = await page.evaluate(() => {
            try {
              let estado = '';
              let sexo = '';
              let lugar = '';

              let bodyText = document.querySelector('body').textContent;
              const estadoMatch = bodyText.match(/Estado:\s*([\w\s]+)/);
              const sexoMatch = bodyText.match(/Sexo:\s*([\w\s]+)/);
              const lugarMatch = bodyText.match(
                /Lugar de RQ:\s*([^\n]+)\s*Delito\(s\):/,
              );

              if (estadoMatch) {
                estado = estadoMatch[1].trim().split('  ')[0];
              }

              if (sexoMatch) {
                const sexoValue = sexoMatch[1].trim();
                sexo = sexoValue.includes('Masculino')
                  ? 'M'
                  : sexoValue.includes('Femenino')
                    ? 'F'
                    : '';
              }

              if (lugarMatch) {
                lugar = lugarMatch?.[1]?.trim() || '';
              }

              return { estado, sexo, lugar };
            } catch (error) {
              return { estado: '', sexo: '', lugar: '' };
            }
          });

          return { ...data, pageUrl };
        } catch (error) {
          return { estado: '', sexo: '', lugar: '' };
        } finally {
          await page.close();
        }
      };

      const data = await Promise.all(
        hashIds.map(async (hashId) => {
          return {
            hashId,
            ...(await scrapePage(
              `https://www.recompensas.pe/requisitoriados/details/${hashId}`,
            )),
          };
        }),
      );

      await browser.close();

      res.status(200).send({
        data,
        status: true,
      });
    } catch (error) {
      // console.error('Error al extraer los datos:', error);
      res.status(500).send({
        status: false,
        message: 'Error al extraer los datos.',
      });
    }
  }

  @Get('proxy-8')
  async Proxy8(@Query() entidad: any, @Res() res): Promise<void> {
    const proxyUrl = this.Proxys['proxy-8'];
    if (!proxyUrl) {
      res.status(400).send({
        status: false,
        message: 'El proxy solicitado no existe.',
      });
      return;
    }

    let url1 = proxyUrl + 'inhabil_publi_mes.asp';
    let url2 = proxyUrl + 'Sancionadosmulta_publi_mes.asp';

    const browserP = puppeteer.launch({...this.CONFIG[this.AMBIT]});

    (async () => {
      const browser = await browserP;

      const scrapePage = async (pageUrl: string, ind: number) => {
        const page = await browser.newPage();
        try {
          await page.setUserAgent(
            '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
          );
          await page.setExtraHTTPHeaders({
            'Accept-Language': 'es',
          });

          await page.goto(pageUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 10000,
          });

          let data = [];
          if (ind == 1) {
            data = await page.evaluate(() => {
              const elements = document.querySelectorAll('table tr');
              return Array.from(elements).map((element, index) => {
                const cells = Array.from(element.querySelectorAll('td'));

                if (index === 0 || cells.length <= 4) {
                  return {
                    id: null,
                  };
                }

                let nombre = '';
                let ruc = '';
                let mas = '';
                let nacionalidad = 'PERÚ';
                let lugar = 'PERÚ';
                let fecha = '';
                let id = '';
                let link = '';

                try {
                  // nombre
                  nombre = cells[2]?.textContent?.trim() || '';

                  // ruc
                  ruc = cells[3].querySelector('a')
                    ? cells[3].querySelector('a').textContent.trim()
                    : cells[3].querySelector('div')
                      ? cells[3].querySelector('div').textContent.trim()
                      : '';

                  // mas
                  mas =
                    (cells[4].textContent || '').trim() +
                    ' - ' +
                    (cells[8].textContent || '').trim();

                  // fecha
                  fecha = cells[6].textContent.trim();

                  // id extraction
                  const anchorElement = cells[3]?.querySelector(
                    "a.btn.btn-link[onclick^='ver_record']",
                  );
                  if (anchorElement) {
                    const onclickValue = anchorElement.getAttribute('onclick');
                    const match = onclickValue.match(/ver_record\('(\d+)'/);
                    if (match && match[0]) {
                      id = match[0];
                      id = id.replace("ver_record('", '').replace("'", '');
                    }
                  }

                  link = `http://www.osce.gob.pe/consultasenlinea/inhabilitados/record.asp?IdNumInhab=${id}&IdSancionado=&tipo_sac=I`;
                } catch (error) {
                  // console.error('Error processing row:', error);
                }

                return {
                  nombre,
                  ruc,
                  mas,
                  nacionalidad,
                  lugar,
                  fecha,
                  id,
                  link,
                };
              });
            });
          }

          if (ind == 2) {
            data = await page.evaluate(() => {
              const elements = document.querySelectorAll('table tr');
              return Array.from(elements).map((element, index) => {
                const cells = Array.from(element.querySelectorAll('td'));

                if (index === 0 || cells.length <= 4) {
                  return {
                    id: null,
                  };
                }

                let nombre = '';
                let ruc = '';
                let mas = '';
                let nacionalidad = 'PERÚ';
                let lugar = 'PERÚ';
                let fecha = '';
                let id = '';
                let link = '';

                try {
                  // nombre
                  nombre = cells[1]?.textContent?.trim() || '';

                  // ruc
                  ruc = cells[2].querySelector('a')
                    ? cells[2].querySelector('a').textContent.trim()
                    : cells[2].querySelector('div')
                      ? cells[2].querySelector('div').textContent.trim()
                      : '';

                  // mas
                  mas =
                    (cells[3].textContent || '').trim() +
                    ' - ' +
                    (cells[6].textContent || '').trim() +
                    ' - ' +
                    'Multa de ' +
                    (cells[5].textContent || '').trim();

                  // fecha
                  fecha = cells[4].textContent.trim();

                  link = `http://www.osce.gob.pe/consultasenlinea/inhabilitados/Sancionadosmulta_publi_mes.asp`;
                } catch (error) {
                  // console.error('Error processing row:', error);
                }

                return {
                  nombre,
                  ruc,
                  mas,
                  nacionalidad,
                  lugar,
                  fecha,
                  id,
                  link,
                };
              });
            });
          }

          return data;
        } catch (error) {
          // console.error(`Error en la página ${pageUrl}:`, error);
          return [];
        } finally {
          await page.close();
        }
      };

      try {
        const data1 = await scrapePage(url1, 1);
        const data2 = await scrapePage(url2, 2);

        res.status(200).send({
          data: data1.concat(data2),
          // data: data1,
          status: true,
        });
      } catch (error) {
        // console.error('Error al extraer los datos:', error);
        res.status(500).send({
          status: false,
          message: 'Error al extraer los datos.',
        });
      } finally {
        await browser.close();
      }
    })();
  }

  @Get('proxy-9')
  async Proxy9(@Query() entidad: any, @Res() res): Promise<void> {
    const proxyUrl = this.Proxys['proxy-9'];
    if (!proxyUrl) {
      res.status(400).send({
        status: false,
        message: 'El proxy solicitado no existe.',
      });
      return;
    }

    let url1 = proxyUrl;

    const browserP = puppeteer.launch({...this.CONFIG[this.AMBIT]});

    (async () => {
      const browser = await browserP;

      const scrapePage = async (pageUrl: string, ind: number) => {
        const page = await browser.newPage();
        try {
          await page.setUserAgent(
            '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
          );
          await page.setExtraHTTPHeaders({
            'Accept-Language': 'es',
          });

          await page.goto(pageUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 10000,
          });

          await page.waitForSelector('.ui-paginator-rpp-options', {
            timeout: 10000,
          });

          let data = await page.evaluate(async () => {
            // Cambiar el valor de 'select' para mostrar 100 resultados por página
            let selects = document.querySelectorAll(
              '.ui-paginator-rpp-options',
            );

            selects.forEach((select) => {
              select['value'] = '100';
            });

            selects.forEach((select) => {
              let event = new Event('change', { bubbles: true });
              select.dispatchEvent(event);
            });

            await new Promise((resolve) => setTimeout(resolve, 2000));

            return [];
          });

          await page.waitForSelector('#frmResultados table tr', {
            timeout: 10000,
          });

          data = await page.evaluate(() => {
            const elements = document.querySelectorAll(
              '#frmResultados table tr',
            );

            return Array.from(elements).map((element, index) => {
              const cells = Array.from(element.querySelectorAll('td'));

              if (index === 0 || cells.length <= 4) {
                return {
                  id: null,
                };
              }

              let nombrexapellido = '';
              let nombre = '';
              let apellido = '';
              let identificacion = '';
              let genero = '';
              let nacionalidad = 'PERÚ';
              let mas = '';
              let fecha = '';

              try {
                // nombre
                nombrexapellido = cells[3]?.textContent?.trim() || '';
                nombre = nombrexapellido.split(',')[1]?.trim() || '';
                apellido = nombrexapellido.split(',')[0]?.trim() || '';
                identificacion = cells[2]?.textContent?.trim() || '';
                mas =
                  'Nro. Inscrición: ' +
                  (cells[1]?.textContent?.trim() || '') +
                  '\n - ' +
                  'Sancionado por ' +
                  (cells[6]?.textContent?.trim() || '') +
                  '\n - ' +
                  'Por el periodo de ' +
                  (cells[8]?.textContent?.trim() || '') +
                  '\n - ' +
                  'Sanción: ' +
                  (cells[7]?.textContent?.trim() || '');

                fecha = cells[8]?.textContent?.trim() || '';
                fecha = fecha.split(' - ')[0];

                return {
                  nombre,
                  apellido,
                  identificacion,
                  genero,
                  nacionalidad,
                  mas,
                  fecha,
                  link: 'https://rnas.minjus.gob.pe/rnas/public/sancionado/sancionadoMain.xhtml',
                };
              } catch (error) {
                // console.error('Error processing row:', error);
              }
            });
          });

          // obtener genero
          data = await Promise.all(
            data.map(async (item) => {
              try {
                const genero = await this.ObtenerGenero(item.nombre);
                return {
                  ...item,
                  genero,
                };
              } catch (error) {
                // console.error('Error al obtener el género:', error);
                return {
                  ...item,
                  genero: '',
                };
              }
            }),
          );

          return data;
        } catch (error) {
          // console.error(`Error en la página ${pageUrl}:`, error);
          return [];
        } finally {
          await page.close();
        }
      };

      try {
        const data1 = await scrapePage(url1, 1);

        res.status(200).send({
          data: data1,
          status: true,
        });
      } catch (error) {
        // console.error('Error al extraer los datos:', error);
        res.status(500).send({
          status: false,
          message: 'Error al extraer los datos.',
        });
      } finally {
        await browser.close();
      }
    })();

    // let browserP;
    // let page;

    // try {
    //   browserP = await puppeteer.launch({
    //     args: ['--no-sandbox', '--disable-setuid-sandbox'],
    //     headless: true,
    //     dumpio: true,
    //   });

    //   page = await browserP.newPage();
    //   await page.setUserAgent(
    //     '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
    //   );

    //   await page.setExtraHTTPHeaders({
    //     'Accept-Language': 'es',
    //   });

    //   await page.goto(proxyUrl, {
    //     waitUntil: 'domcontentloaded',
    //   });
    //   try {
    //     let data = await page.evaluate(() => {
    //       // actualziar valor de #frmResultados:grid_rppDD
    //       document.querySelector('#frmResultados:grid_rppDD')['value'] = 100;

    //       // const elements = document.querySelectorAll('form#frmResultados table tr');
    //       // let data = [];
    //       // if (elements.length > 0) {
    //       //   for (let i = 1; i < elements.length; i++) {
    //       //     const element = elements[i];
    //       //     const cells = element.querySelectorAll('td');

    //       //     let nombrexapellido = cells[3]?.textContent?.trim() || '';
    //       //     let identificacion = cells[2]?.textContent?.trim() || '';
    //       //     let nombre = nombrexapellido.split(',')[1]?.trim() || '';
    //       //     let apellido = nombrexapellido.split(',')[0]?.trim() || '';
    //       //     let genero = '';
    //       //     let nacionalidad = 'PERÚ';
    //       //     let mas = "Sancionado por " + (cells[6]?.textContent?.trim() || '') + " - Por el periodo de " + (cells[8]?.textContent?.trim() || '');

    //       //     data.push({
    //       //       nombre,
    //       //       apellido,
    //       //       identificacion,
    //       //       genero,
    //       //       nacionalidad,
    //       //       mas,
    //       //       link: "https://rnas.minjus.gob.pe/rnas/public/sancionado/sancionadoMain.xhtml"
    //       //     });
    //       //   }
    //       // }
    //       return document.querySelector('#frmResultados:grid_rppDD')['value'];
    //     });

    //     res.status(200).send({
    //       data: data,
    //       status: true,
    //     });

    //     await page.close();
    //   } catch (error) {}
    // } catch (error) {
    //   res.status(500).send({ error: 'Error durante la ejecución del proxy' });
    // } finally {
    //   await browserP.close();
    // }
  }

  @Post('send-email')
  async SendEmail(@Body() entidad: any, @Res() res): Promise<void> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Datos');
      const headerRange = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
      ];

      worksheet.columns = [
        { header: 'TIPO', key: 'tipo', width: 15 },
        { header: 'APELLIDOS', key: 'apellidos', width: 20 },
        { header: 'NOMBRE', key: 'nombre', width: 20 },
        { header: 'PRO', key: 'pro', width: 15 },
        { header: 'CARGO', key: 'cargo', width: 20 },
        { header: 'LINK', key: 'link', width: 30 },
        { header: 'ALIAS', key: 'alias', width: 15 },
        { header: 'IDENTIFICACION', key: 'identificacion', width: 20 },
        { header: 'PASAPORTE', key: 'pasaporte', width: 20 },
        { header: 'NACIONALIDAD', key: 'nacionalidad', width: 20 },
        { header: 'GENERO', key: 'genero', width: 10 },
        { header: 'MAS', key: 'mas', width: 10 },
        { header: 'FECHA', key: 'fecha', width: 15 },
        { header: 'LUGAR', key: 'lugar', width: 20 },
      ];

      entidad.data.forEach((item) => {
        worksheet.addRow({
          tipo: item.infotipo || '',
          apellidos: item.infoapellidos || '',
          nombre: item.infonombres || '',
          pro: item.infoprog || '',
          cargo: item.infocargo || '',
          link: item.infolink || '',
          alias: item.infoalias || '',
          identificacion: item.infotipodocumento || '',
          pasaporte: item.infopasaporte || '',
          nacionalidad: item.infonacionalidad || '',
          genero: item.infogenero || '',
          mas: item.infomas || '',
          fecha: item.infofecha || '',
          lugar: item.infolugar || '',
        });
      });

      headerRange.forEach((col) => {
        const cell = worksheet.getCell(`${col}1`);
        cell.font = { bold: true, color: { argb: '#000000' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' },
        };
        cell.alignment = { horizontal: 'center' };
      });

      worksheet.autoFilter = 'A1:N1';

      const buffer = await workbook.xlsx.writeBuffer();

      let emails = ['ccarbajalmt0520@gmail.com', 'ccarbajal@ccfirma.com'];
      const mailOptions = {
        from: '"Comply Tools" <complytools@gmail.com>',
        to: emails.join(', '),
        subject: `Informe de lista ${entidad.tipo} del ${entidad.fecha}`,
        text: '',
        attachments: [
          {
            filename: `Informe de lista ${entidad.tipo}.xlsx`,
            content: buffer,
            encoding: 'base64',
          },
        ],
      };

      await this.transporter.sendMail(mailOptions);
      res.status(200).send('Correo enviado exitosamente');
    } catch (error) {
      // console.error(error);
      res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }

  @Get('genero')
  async Genero(@Query() entidad: any, @Res() res): Promise<void> {
    if (!entidad.name) {
      return res.status(400).send({
        status: false,
        message: 'Faltan parámetros.',
      });
    }

    try {
      const genero = await this.ObtenerGenero(entidad.name);
      res.status(200).send({
        genero,
        status: true,
      });
    } catch (error) {
      res.status(500).send({
        status: false,
        message: 'Error al obtener el género.',
      });
    }
  }

  @Get('translate')
  async Translate(@Query() entidad: any, @Res() res): Promise<void> {
    if (!entidad.text) {
      return res.status(400).send({
        status: false,
        message: 'Faltan parámetros.',
      });
    }

    try {
      const translation = await translate(entidad.text, 'en', 'es');

      res.status(200).send({
        translation,
        status: true,
      });
    } catch (error) {
      // console.error('Error al traducir:', error);
      res.status(500).send({
        status: false,
        message: 'Error al traducir.',
      });
    }
  }

  private async ObtenerGenero(name: string): Promise<string> {
    name = name.split(' ')[0]?.toLowerCase() || '';
    try {
      let gender = await getGender(name, 'es');
      return gender == 'male' ? 'M' : gender == 'female' ? 'F' : '';
    } catch (error) {
      return '';
    }
  }
}
