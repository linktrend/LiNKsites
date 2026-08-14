-- Template identities are stable slugs; the selected Library release supplies
-- the actual template contract. Keep the database open to approved vertical
-- templates while rejecting malformed identities.
alter table lsites_sites.working_packages
  alter column template_id set default 'master-template-type-1';

alter table lsites_sites.working_packages
  drop constraint if exists working_packages_template_id_check;

alter table lsites_sites.working_packages
  add constraint working_packages_template_id_check
  check (template_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

alter table lsites_sites.working_content_versions
  alter column template_id set default 'master-template-type-1';

alter table lsites_sites.working_content_versions
  drop constraint if exists working_content_versions_template_id_check;

alter table lsites_sites.working_content_versions
  add constraint working_content_versions_template_id_check
  check (template_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
