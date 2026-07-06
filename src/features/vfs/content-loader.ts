import profile from "../../../content/profile.json";
import skills from "../../../content/skills.json";
import projectsIndex from "../../../content/projects/index.json";
import { manifestoContent } from "@/content-data/manifesto";
import { motdContent } from "@/content-data/motd";
import { osReleaseContent } from "@/content-data/os-release";
import { contactScriptContent } from "@/content-data/contact";
import { projectReadmes } from "@/content-data/projects";
import type { ProfileContent, ProjectMeta, VfsNode } from "@/types/root-os";

export function loadProfileContent(): ProfileContent {
  return profile as ProfileContent;
}

function buildProjectsTree(): Record<string, VfsNode> {
  const readmes: Record<string, string> = projectReadmes;

  const children: Record<string, VfsNode> = {};

  for (const project of projectsIndex as ProjectMeta[]) {
    const slug = project.slug;
    children[slug] = {
      type: "directory",
      name: slug,
      children: {
        "README.md": {
          type: "file",
          name: "README.md",
          content: readmes[slug] ?? `# ${project.title}\n`,
        },
        "meta.json": {
          type: "file",
          name: "meta.json",
          content: JSON.stringify(project, null, 2),
        },
      },
    };
  }

  return children;
}

export function buildVfsTree(): VfsNode {
  const profileData = loadProfileContent();
  const aboutText = [
    profileData.name,
    profileData.role,
    profileData.tagline,
    "",
    `Email: ${profileData.email}`,
    `GitHub: ${profileData.github}`,
  ].join("\n");

  return {
    type: "directory",
    name: "/",
    children: {
      home: {
        type: "directory",
        name: "home",
        children: {
          guest: {
            type: "directory",
            name: "guest",
            children: {
              "about.txt": {
                type: "file",
                name: "about.txt",
                content: aboutText,
              },
              "manifesto.md": {
                type: "file",
                name: "manifesto.md",
                content: manifestoContent,
              },
              projects: {
                type: "directory",
                name: "projects",
                children: buildProjectsTree(),
              },
              "skills.json": {
                type: "file",
                name: "skills.json",
                content: JSON.stringify(skills, null, 2),
              },
              "contact.sh": {
                type: "file",
                name: "contact.sh",
                content: contactScriptContent,
              },
            },
          },
        },
      },
      etc: {
        type: "directory",
        name: "etc",
        children: {
          motd: {
            type: "file",
            name: "motd",
            content: motdContent,
          },
          "os-release": {
            type: "file",
            name: "os-release",
            content: osReleaseContent,
          },
        },
      },
      usr: {
        type: "directory",
        name: "usr",
        children: {
          share: {
            type: "directory",
            name: "share",
            children: {
              docs: {
                type: "directory",
                name: "docs",
                children: {
                  "help.txt": {
                    type: "file",
                    name: "help.txt",
                    content: "See 'help' command for available commands.",
                  },
                },
              },
            },
          },
        },
      },
      bin: {
        type: "directory",
        name: "bin",
        children: {},
      },
    },
  };
}
