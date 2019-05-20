import { EComponentType, IComponent } from './collector';

const isAtom = (component: IComponent): boolean => component.type === EComponentType.Atom;
const isMolecule = (component: IComponent): boolean => component.type === EComponentType.Molecule;
const isOrganism = (component: IComponent): boolean => component.type === EComponentType.Organism;
const isDeprecated = (component: IComponent): boolean => component.files.deprecated.exists;
const hasReadme = (component: IComponent): boolean => component.files.readme.exists;
const hasTwig = (component: IComponent): boolean => component.files.twig.exists;
const hasSass = (component: IComponent): boolean => component.files.sass.exists;
const hasTypescript = (component: IComponent): boolean => component.files.typescript.exists;

export interface IReport {
    counts: {
        atoms: number
        molecules: number
        organisms: number
        components: number
        componentsWithReadme: number
        componentsWithTwig: number
        componentsWithSass: number
        componentsWithTypescript: number
        deprecatedComponents: number
    }
}

export const getReport = (components: IComponent[]): IReport => {
    return {
        counts: {
            atoms: components.filter(isAtom).length,
            molecules: components.filter(isMolecule).length,
            organisms: components.filter(isOrganism).length,
            components: components.length,
            componentsWithReadme: components.filter(hasReadme).length,
            componentsWithTwig: components.filter(hasTwig).length,
            componentsWithSass: components.filter(hasSass).length,
            componentsWithTypescript: components.filter(hasTypescript).length,
            deprecatedComponents: components.filter(isDeprecated).length
        }
    }
}
