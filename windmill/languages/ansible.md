# Ansible Scripts

Ansible playbook execution for infrastructure automation.

## Conventions

- Standard Ansible playbook YAML format
- Define tasks, hosts, and variables
- Use resources for SSH credentials and inventory

## Example

```yaml
---
- name: Deploy application
  hosts: all
  become: yes
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes

    - name: Install nginx
      apt:
        name: nginx
        state: present

    - name: Start nginx service
      service:
        name: nginx
        state: started
        enabled: yes

    - name: Copy configuration
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
      notify: Restart nginx

  handlers:
    - name: Restart nginx
      service:
        name: nginx
        state: restarted
```
