---
layout: page
title: Friends of the Bloomingdale Trail Board of Directors
---

<div class="row">
    <div class="col-md-7">
        <h2>Current board</h2>
        <ul>
        {% for member in site.data.board_members %}
           <li>
            {% if member.officer %}
                {{ member.name }}, {{ member.officer }}
            {% elsif member.pac %}
                {{ member.name }}, {{ member.pac }}
            {% else %}
                {{ member.name }}
            {% endif %}
           </li>
        {% endfor %}
        </ul>

        <h2>Board structure</h2>

        <p>FBT is committed to having members inclusive of the entire Bloomingdale corridor
        and to maintaining a strong link between the Bloomingdale Trail and all the
        parks that make up The 606 network. To achieve these goals FBT will always
        maintain at least 2 representatives from each of the 4 neighborhoods that line
        the Trail (Humboldt Park, Logan Square, Wicker Park and Bucktown) and one
        representative from each of the adjoining Park Advisory Councils (Walsh Park,
        Churchill Field, Milwaukee/Leavitt, Julia deBurgos, Kimball, Ridgeway).
        </p>

        <h3>Past board members</h3>
        <ul>
        {% for member in site.data.past_board_members %}
            <li>{{ member }}</li>
        {% endfor %}
        </ul>
    </div>
    <div class="col-md-5">
        <h2>In memory, Dan Drew</h2>
        <p><img alt="Photo of Dan Drew" src="/img/dan-drew.jpg"></p>
    </div>
</div>

