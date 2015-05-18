---
layout: page
title: Board of Directors
---

<div class="in-memory-dan-drew">
    <h2>In memory, Dan Drew</h2>
    <div><img alt="Photo of Dan Drew" src="/img/dan-drew.jpg"></div>
</div>

## Board Structure

FBT is committed to having members inclusive of the entire Bloomingdale corridor
and to maintaining a strong link between the Bloomingdale Trail and all the
parks that make up The 606 network. To achieve these goals FBT will always
maintain at least 2 representatives from each of the 4 neighborhoods that line
the Trail (Humboldt Park, Logan Square, Wicker Park and Bucktown) and one
representative from each of the adjoining Park Advisory Councils (Walsh Park,
Churchill Field, Milwaukee/Leavitt, Julia deBurgos, Kimball, Ridgeway).

## Current board

{% for member in site.data.board_members %}
* {{ member.name }}
{% endfor %}

## Past board members

{% for member in site.data.past_board_members %}
* {{ member }}
{% endfor %}
